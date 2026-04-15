const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, upload.single('avatar'), updateProfile);
router.put('/changepassword', protect, changePassword);
router.post('/wishlist/:eventId', protect, toggleWishlist);

module.exports = router;
