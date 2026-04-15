const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @route GET /api/reviews/event/:eventId
exports.getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId }).populate('user', 'name avatar').sort('-createdAt');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) { next(err); }
};

// @route POST /api/reviews/event/:eventId
exports.createReview = async (req, res, next) => {
  try {
    // Must have attended the event
    const attended = await Booking.findOne({ user: req.user.id, event: req.params.eventId, status: 'confirmed' });
    if (!attended) return res.status(403).json({ success: false, message: 'You must attend the event to review it' });

    const review = await Review.create({ event: req.params.eventId, user: req.user.id, ...req.body });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

// @route PUT /api/reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    Object.assign(review, req.body);
    await review.save();
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

// @route DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};
