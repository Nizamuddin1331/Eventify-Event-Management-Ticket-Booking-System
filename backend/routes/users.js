// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get public user profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar bio role createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;
