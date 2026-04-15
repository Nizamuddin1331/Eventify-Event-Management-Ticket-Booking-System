// payments route (stub for Stripe/Razorpay integration)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Simulated Razorpay-style order creation
router.post('/create-order', protect, async (req, res) => {
  const { amount } = req.body;
  // In production: call Razorpay/Stripe API here
  res.json({
    success: true,
    order: {
      id: 'order_' + Date.now(),
      amount: amount * 100, // paise
      currency: 'INR',
      status: 'created'
    }
  });
});

// Simulate payment verification
router.post('/verify', protect, async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  // In production: verify HMAC signature
  res.json({ success: true, verified: true, paymentId });
});

module.exports = router;
