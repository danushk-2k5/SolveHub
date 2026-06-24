const express = require('express');
const router = express.Router();
const {
    createReview,
    getTechnicianReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public route - get reviews for a technician
router.get('/:technicianId', getTechnicianReviews);

// Protected routes
router.post('/', protect, authorize('customer'), createReview);
router.get('/customer/my-reviews', protect, authorize('customer'), getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
