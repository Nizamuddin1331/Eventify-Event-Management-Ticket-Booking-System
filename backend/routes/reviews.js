const express = require('express');
const router = express.Router();
const { getEventReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/event/:eventId', getEventReviews);
router.post('/event/:eventId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
