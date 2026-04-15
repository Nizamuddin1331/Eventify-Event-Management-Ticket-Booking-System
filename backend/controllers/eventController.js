const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @route GET /api/events
exports.getEvents = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, date, city, status, sort, page = 1, limit = 12, featured } = req.query;

    const query = { status: 'published' };
    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const sortMap = { newest: '-createdAt', oldest: 'createdAt', price_asc: 'price', price_desc: '-price', date: 'date', rating: '-averageRating' };
    const sortBy = sortMap[sort] || '-createdAt';

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(query).populate('organizer', 'name avatar').sort(sortBy).skip(skip).limit(Number(limit)),
      Event.countDocuments(query)
    ]);

    res.json({ success: true, count: events.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), events });
  } catch (err) { next(err); }
};

// @route GET /api/events/:id
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name avatar email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) { next(err); }
};

// @route POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    req.body.organizer = req.user.id;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    if (images.length) req.body.images = images;
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, event });
  } catch (err) { next(err); }
};

// @route PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }
    if (req.files?.length) req.body.images = req.files.map(f => `/uploads/${f.filename}`);
    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, event });
  } catch (err) { next(err); }
};

// @route DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

// @route GET /api/events/:id/analytics
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const bookings = await Booking.find({ event: req.params.id, status: { $in: ['confirmed'] } });
    const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    res.json({ success: true, analytics: { totalBookings: bookings.length, revenue, totalSeats: event.totalSeats, bookedSeats: event.bookedSeats, availableSeats: event.availableSeats } });
  } catch (err) { next(err); }
};
