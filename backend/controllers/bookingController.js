const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { generateQRCode } = require('../utils/qrcode');
const { sendEmail } = require('../utils/email');

// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, seats } = req.body;

    // Find event with lock-like check
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ success: false, message: 'Event not available for booking' });
    if (event.availableSeats < seats) return res.status(400).json({ success: false, message: `Only ${event.availableSeats} seats available` });
    if (event.date < new Date()) return res.status(400).json({ success: false, message: 'Event has already passed' });

    // Check duplicate booking
    const existing = await Booking.findOne({ user: req.user.id, event: eventId, status: { $in: ['pending', 'confirmed'] } });
    if (existing) return res.status(400).json({ success: false, message: 'You already have a booking for this event' });

    const totalAmount = event.price * seats;
    const seatNumbers = Array.from({ length: seats }, (_, i) => `${String.fromCharCode(65 + Math.floor((event.bookedSeats + i) / 10))}${(event.bookedSeats + i) % 10 + 1}`);

    const booking = await Booking.create({
      user: req.user.id, event: eventId, seats, seatNumbers, totalAmount,
      payment: { method: 'simulated', status: 'pending' }
    });

    res.status(201).json({ success: true, booking });
  } catch (err) { next(err); }
};

// @route POST /api/bookings/:id/pay  (simulate payment)
exports.processPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status === 'confirmed') return res.status(400).json({ success: false, message: 'Already confirmed' });

    const { method = 'simulated', simulateFailure = false } = req.body;
    if (simulateFailure) {
      booking.payment.status = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment failed. Please try again.' });
    }

    // Update booking and event atomically-ish
    const event = await Event.findById(booking.event._id);
    if (event.availableSeats < booking.seats) {
      return res.status(400).json({ success: false, message: 'Seats no longer available' });
    }

    event.bookedSeats += booking.seats;
    event.availableSeats = event.totalSeats - event.bookedSeats;
    await event.save();

    const txId = 'TXN-' + Date.now();
    booking.status = 'confirmed';
    booking.payment = { method, status: 'completed', transactionId: txId, paidAt: new Date() };
    booking.qrCode = await generateQRCode(booking.bookingId);
    await booking.save();

    // Emit real-time seat update
    if (req.io) req.io.to(`event_${event._id}`).emit('seats_updated', { eventId: event._id, availableSeats: event.availableSeats });

    // Send confirmation email
    await sendEmail({
      to: booking.user.email,
      subject: `Booking Confirmed - ${booking.event.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#6366f1">🎫 Booking Confirmed!</h2>
          <p>Hi <strong>${booking.user.name}</strong>,</p>
          <p>Your booking for <strong>${booking.event.title}</strong> is confirmed.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Booking ID</strong></td><td style="padding:8px">${booking.bookingId}</td></tr>
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Event</strong></td><td style="padding:8px">${booking.event.title}</td></tr>
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Date</strong></td><td style="padding:8px">${new Date(booking.event.date).toLocaleDateString()}</td></tr>
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Seats</strong></td><td style="padding:8px">${booking.seats} (${booking.seatNumbers.join(', ')})</td></tr>
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Amount Paid</strong></td><td style="padding:8px">₹${booking.totalAmount}</td></tr>
            <tr><td style="padding:8px;background:#f4f4f5"><strong>Transaction ID</strong></td><td style="padding:8px">${txId}</td></tr>
          </table>
          <p>Show this booking ID at the venue for entry.</p>
          <p style="color:#888;font-size:12px">Eventify — Your Event, Your Way</p>
        </div>`
    });

    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

// @route GET /api/bookings/mybookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('event', 'title date location images price').sort('-createdAt').skip(skip).limit(Number(limit)),
      Booking.countDocuments(query)
    ]);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// @route GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

// @route PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled' });

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    if (booking.payment.status === 'completed') booking.payment.status = 'refunded';
    await booking.save();

    // Release seats
    await Event.findByIdAndUpdate(booking.event, { $inc: { bookedSeats: -booking.seats, availableSeats: booking.seats } });

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) { next(err); }
};

// @route GET /api/bookings/:id/ticket  (PDF download)
exports.downloadTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event').populate('user', 'name email');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status !== 'confirmed') return res.status(400).json({ success: false, message: 'Only confirmed bookings can generate tickets' });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${booking.bookingId}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#6366f1');
    doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('EVENTIFY', 40, 20);
    doc.fontSize(10).font('Helvetica').text('Your Event Ticket', 40, 52);

    // Content
    doc.fillColor('#1f2937').fontSize(18).font('Helvetica-Bold').text(booking.event.title, 40, 100);
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    const details = [
      ['Booking ID', booking.bookingId],
      ['Date', new Date(booking.event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
      ['Time', booking.event.time],
      ['Venue', booking.event.location.venue],
      ['Seats', `${booking.seats} (${booking.seatNumbers.join(', ')})`],
      ['Attendee', booking.user.name],
      ['Amount Paid', `₹${booking.totalAmount}`],
      ['Transaction ID', booking.payment.transactionId || 'N/A'],
    ];
    details.forEach(([label, value]) => {
      doc.fillColor('#6b7280').text(label + ':', { continued: true }).fillColor('#111827').text('  ' + value);
    });

    // QR code
    if (booking.qrCode) {
      const base64Data = booking.qrCode.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      doc.image(imgBuffer, doc.page.width - 140, 90, { width: 100 });
    }

    // Footer
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#f3f4f6');
    doc.fillColor('#9ca3af').fontSize(9).text('This is an e-ticket. Please present at the venue entry.', 40, doc.page.height - 28);
    doc.end();
  } catch (err) { next(err); }
};
