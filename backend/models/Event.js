const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:       { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
  organizer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:    { type: String, enum: ['music', 'sports', 'tech', 'food', 'art', 'business', 'education', 'health', 'other'], default: 'other' },
  date:        { type: Date, required: [true, 'Event date is required'] },
  endDate:     { type: Date },
  time:        { type: String, required: [true, 'Event time is required'] },
  location: {
    venue:   { type: String, required: true },
    address: String,
    city:    String,
    state:   String,
    country: { type: String, default: 'India' },
    coordinates: { lat: Number, lng: Number }
  },
  price:          { type: Number, required: true, min: 0 },
  totalSeats:     { type: Number, required: true, min: 1 },
  bookedSeats:    { type: Number, default: 0 },
  availableSeats: { type: Number },
  images:         [{ type: String }],
  tags:           [{ type: String }],
  status:         { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'published' },
  isFeatured:     { type: Boolean, default: false },
  averageRating:  { type: Number, default: 0, min: 0, max: 5 },
  numReviews:     { type: Number, default: 0 },
}, { timestamps: true });

// Compute availableSeats before save
EventSchema.pre('save', function(next) {
  this.availableSeats = this.totalSeats - this.bookedSeats;
  next();
});

// Virtual: isSoldOut
EventSchema.virtual('isSoldOut').get(function() {
  return this.availableSeats <= 0;
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
EventSchema.index({ date: 1, category: 1, price: 1 });

module.exports = mongoose.model('Event', EventSchema);
