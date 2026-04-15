const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  event:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });

ReviewSchema.index({ event: 1, user: 1 }, { unique: true }); // one review per user per event

// After save: recalculate event average rating
ReviewSchema.statics.calcAverageRating = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { event: eventId } },
    { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const Event = require('./Event');
  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, { averageRating: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].count });
  } else {
    await Event.findByIdAndUpdate(eventId, { averageRating: 0, numReviews: 0 });
  }
};

ReviewSchema.post('save', function() { this.constructor.calcAverageRating(this.event); });
ReviewSchema.post('remove', function() { this.constructor.calcAverageRating(this.event); });

module.exports = mongoose.model('Review', ReviewSchema);
