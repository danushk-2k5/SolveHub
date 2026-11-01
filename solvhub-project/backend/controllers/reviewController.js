const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Technician = require('../models/Technician');

const pagination = (page, limit) => ({
    page: Math.max(1, Number.parseInt(page, 10) || 1),
    limit: Math.max(1, Number.parseInt(limit, 10) || 10)
});

const refreshTechnicianRating = async (technicianId) => {
    const [stats] = await Review.aggregate([
        { $match: { technicianId: new mongoose.Types.ObjectId(String(technicianId)) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);

    await Technician.findByIdAndUpdate(technicianId, {
        rating: stats ? Number(stats.avgRating.toFixed(1)) : 0,
        totalReviews: stats ? stats.totalReviews : 0
    });
};

exports.createReview = async (req, res, next) => {
    try {
        const { technicianId, bookingId, rating, comment } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (String(booking.customerId) !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        if (booking.status !== 'completed')
            return res.status(400).json({ message: 'Can only review completed bookings' });
        if (String(booking.technicianId) !== String(technicianId))
            return res.status(400).json({ message: 'Technician does not match the booking' });
        if (await Review.exists({ bookingId }))
            return res.status(400).json({ message: 'Review already exists for this booking' });

        const review = await Review.create({
            customerId: req.user.id, technicianId, bookingId, rating, comment
        });
        await refreshTechnicianRating(technicianId);
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

exports.getTechnicianReviews = async (req, res, next) => {
    try {
        const { page, limit } = pagination(req.query.page, req.query.limit);
        const query = { technicianId: req.params.technicianId };
        const [rows, total, stats] = await Promise.all([
            Review.find(query)
                .populate('customer', 'name avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Review.countDocuments(query),
            Review.aggregate([
                { $match: { technicianId: new mongoose.Types.ObjectId(req.params.technicianId) } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
            ])
        ]);
        const reviewStats = stats[0]
            ? { avgRating: stats[0].avgRating, totalReviews: stats[0].totalReviews }
            : { avgRating: 0, totalReviews: 0 };
        res.json({ success: true, count: rows.length, total, stats: reviewStats, data: rows });
    } catch (error) {
        next(error);
    }
};

exports.getMyReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ customerId: req.user.id })
            .populate({ path: 'technician', populate: { path: 'user', select: 'name avatar' } })
            .sort({ createdAt: -1 });
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        next(error);
    }
};

exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.customerId) !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        if (req.body.rating !== undefined) review.rating = req.body.rating;
        if (req.body.comment !== undefined) review.comment = req.body.comment;
        await review.save();
        await refreshTechnicianRating(review.technicianId);
        res.json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (String(review.customerId) !== req.user.id && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const technicianId = review.technicianId;
        await review.deleteOne();
        await refreshTechnicianRating(technicianId);
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        next(error);
    }
};
