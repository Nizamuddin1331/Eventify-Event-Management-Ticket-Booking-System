const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @route GET /api/admin/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenueResult, recentBookings, topEvents] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Booking.find({ status: 'confirmed' }).populate('user', 'name email').populate('event', 'title').sort('-createdAt').limit(10),
      Event.find().sort('-bookedSeats').limit(5).select('title bookedSeats totalSeats price')
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalEvents, totalBookings,
        totalRevenue: revenueResult[0]?.total || 0,
        recentBookings, topEvents, monthlyRevenue
      }
    });
  } catch (err) { next(err); }
};

// @route GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};

// @route GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query).populate('user', 'name email').populate('event', 'title date').sort('-createdAt').skip(skip).limit(Number(limit)),
      Booking.countDocuments(query)
    ]);
    res.json({ success: true, bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { next(err); }
};

// @route PUT /api/admin/events/:id/feature
exports.toggleFeatureEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.isFeatured = !event.isFeatured;
    await event.save();
    res.json({ success: true, isFeatured: event.isFeatured });
  } catch (err) { next(err); }
};
