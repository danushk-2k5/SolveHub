const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: users
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify technician
// @route   PUT /api/admin/technicians/:id/verify
// @access  Private (Admin)
router.put('/technicians/:id/verify', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { isVerified } = req.body;
        
        const technician = await Technician.findByIdAndUpdate(
            req.params.id,
            { isVerified },
            { new: true }
        ).populate('userId', 'name email');

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json({
            success: true,
            data: technician
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private (Admin)
router.get('/bookings', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        
        let query = {};
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('technicianId', 'skills rating')
            .populate({
                path: 'technicianId',
                populate: { path: 'userId', select: 'name email' }
            })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            count: bookings.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: bookings
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', protect, authorize('admin'), async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTechnicians = await User.countDocuments({ role: 'technician' });
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalBookings = await Booking.countDocuments();
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });

        // Get recent bookings
        const recentBookings = await Booking.find()
            .populate('customerId', 'name')
            .populate({
                path: 'technicianId',
                populate: { path: 'userId', select: 'name' }
            })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalTechnicians,
                totalCustomers,
                totalBookings,
                completedBookings,
                pendingBookings,
                recentBookings
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin)
router.put('/users/:id/deactivate', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
