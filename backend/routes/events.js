const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getEventAnalytics } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/:id/analytics', protect, authorize('organizer', 'admin'), getEventAnalytics);
router.post('/', protect, authorize('organizer', 'admin'), upload.array('images', 5), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.array('images', 5), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
