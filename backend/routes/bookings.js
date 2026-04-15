const express = require('express');
const router = express.Router();
const { createBooking, processPayment, getMyBookings, getBooking, cancelBooking, downloadTicket } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createBooking);
router.get('/mybookings', getMyBookings);
router.get('/:id', getBooking);
router.post('/:id/pay', processPayment);
router.put('/:id/cancel', cancelBooking);
router.get('/:id/ticket', downloadTicket);

module.exports = router;
