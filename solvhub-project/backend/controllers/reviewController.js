const { fn, col } = require('sequelize');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const User = require('../models/User');

exports.createReview = async (req, res, next) => {
    try {
        const { technicianId, bookingId, rating, comment } = req.body;

        const booking = await Booking.findByPk(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customerId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        if (booking.status !== 'completed') return res.status(400).json({ message: 'Can only review completed bookings' });

        const existing = await Review.findOne({ where: { bookingId } });
        if (existing) return res.status(400).json({ message: 'Review already exists for this booking' });

        const review = await Review.create({ customerId: req.user.id, technicianId, bookingId, rating, comment });
        res.status(201).json({ success: true, data: review });
    } catch (error) { next(error); }
};

exports.getTechnicianReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows, count } = await Review.findAndCountAll({
            where: { technicianId: req.params.technicianId },
            include: [{ model: User, as: 'customer', attributes: ['name', 'avatar'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit), offset
        });

        const stats = await Review.findOne({
            where: { technicianId: req.params.technicianId },
            attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'totalReviews']]
        });

        res.json({ success: true, count: rows.length, total: count, stats: stats.dataValues, data: rows });
    } catch (error) { next(error); }
};

exports.getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            where: { customerId: req.user.id },
            include: [{ model: Technician, as: 'technician', include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) { next(error); }
};

exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.customerId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        await review.update({ rating: req.body.rating, comment: req.body.comment });
        res.json({ success: true, data: review });
    } catch (error) { next(error); }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.customerId !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        await review.destroy();
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) { next(error); }
};
