const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BookingSchema = new mongoose.Schema({
  bookingId:  { type: String, default: () => 'EVT-' + uuidv4().slice(0,8).toUpperCase(), unique: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  seats:      { type: Number, required: true, min: 1, max: 10 },
  seatNumbers:[{ type: String }],
  totalAmount:{ type: Number, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'cancelled', 'refunded'], default: 'pending' },
  payment: {
    method:        { type: String, enum: ['card', 'upi', 'netbanking', 'wallet', 'simulated'], default: 'simulated' },
    transactionId: { type: String },
    status:        { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paidAt:        Date,
  },
  qrCode:     { type: String }, // base64 QR code
  ticketUrl:  { type: String }, // PDF URL
  checkedIn:  { type: Boolean, default: false },
  checkedInAt:{ type: Date },
  cancellationReason: String,
}, { timestamps: true });

BookingSchema.index({ user: 1, event: 1 });
BookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
