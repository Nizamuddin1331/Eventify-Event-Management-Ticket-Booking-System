// routes/admin.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUser, deleteUser, getAllBookings, toggleFeatureEvent } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.put('/events/:id/feature', toggleFeatureEvent);

module.exports = router;
