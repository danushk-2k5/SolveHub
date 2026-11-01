const express = require('express');
const router = express.Router();
const {
    getTechnicians, getTechnician, createTechnician,
    updateTechnician, getMyProfile, updateAvailability
} = require('../controllers/technicianController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const Technician = require('../models/Technician');

// Public routes
router.get('/', getTechnicians);
router.get('/:id', getTechnician);

// Protected routes
router.get('/me/profile', protect, authorize('technician'), getMyProfile);
router.post('/', protect, authorize('technician'), createTechnician);
router.put('/:id', protect, authorize('technician'), updateTechnician);
router.put('/availability/status', protect, authorize('technician'), updateAvailability);

// Photo upload
router.post('/me/photo', protect, authorize('technician'), upload.single('photo'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const photoUrl = `/uploads/${req.file.filename}`;
        const technician = await Technician.findOneAndUpdate(
            { userId: req.user.id },
            { profilePhoto: photoUrl },
            { new: true, runValidators: true }
        );
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
        res.json({ success: true, profilePhoto: photoUrl });
    } catch (err) { next(err); }
});

module.exports = router;
