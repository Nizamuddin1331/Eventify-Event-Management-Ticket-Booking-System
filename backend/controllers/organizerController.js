const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @route GET /api/organizer/events
exports.getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { organizer: req.user.id };
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      Event.countDocuments(query)
    ]);
    res.json({ success: true, events, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// @route GET /api/organizer/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).select('_id title bookedSeats totalSeats price status date');
    const eventIds = events.map(e => e._id);
    const [totalBookings, revenueResult, recentBookings] = await Promise.all([
      Booking.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
      Booking.aggregate([{ $match: { event: { $in: eventIds }, status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.find({ event: { $in: eventIds }, status: 'confirmed' }).populate('user', 'name email').populate('event', 'title date').sort('-createdAt').limit(10)
    ]);
    res.json({
      success: true,
      stats: {
        totalEvents: events.length,
        totalBookings,
        totalRevenue: revenueResult[0]?.total || 0,
        events,
        recentBookings
      }
    });
  } catch (err) { next(err); }
};

// @route GET /api/organizer/events/:id/bookings
exports.getEventBookings = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    const bookings = await Booking.find({ event: req.params.id }).populate('user', 'name email phone').sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) { next(err); }
};
