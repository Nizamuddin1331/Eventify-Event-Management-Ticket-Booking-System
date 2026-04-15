const express = require('express');
const router = express.Router();
const { getMyEvents, getDashboard, getEventBookings } = require('../controllers/organizerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('organizer', 'admin'));
router.get('/dashboard', getDashboard);
router.get('/events', getMyEvents);
router.get('/events/:id/bookings', getEventBookings);

module.exports = router;
