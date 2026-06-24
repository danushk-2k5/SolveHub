const express = require('express');
const router = express.Router();
const {
    createBooking,
    getCustomerBookings,
    getTechnicianBookings,
    getBooking,
    updateBookingStatus,
    cancelBooking,
    getAvailableSlots
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Get available time slots - Public route
router.get('/availability/:technicianId', getAvailableSlots);

// Create booking - Customer only
router.post('/', protect, authorize('customer'), createBooking);

// Get bookings based on role
router.get('/customer', protect, authorize('customer'), getCustomerBookings);
router.get('/technician', protect, authorize('technician'), getTechnicianBookings);

// Get single booking
router.get('/:id', protect, getBooking);

// Update booking status
router.put('/:id/status', protect, updateBookingStatus);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
