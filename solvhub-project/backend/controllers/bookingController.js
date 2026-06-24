const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const User = require('../models/User');
const Review = require('../models/Review');

exports.createBooking = async (req, res, next) => {
    try {
        const { technicianId, serviceType, description, bookingDate, bookingTime, address, estimatedCost } = req.body;

        const technician = await Technician.findByPk(technicianId);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        if (!technician.isAvailable) return res.status(400).json({ message: 'Technician is not available' });

        const booking = await Booking.create({
            customerId: req.user.id, technicianId, serviceType, description,
            bookingDate, bookingTime, address, estimatedCost: estimatedCost || technician.hourlyRate
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) { next(error); }
};

exports.getCustomerBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const where = { customerId: req.user.id };
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows, count } = await Booking.findAndCountAll({
            where,
            include: [{ model: Technician, as: 'technician', include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit), offset
        });

        res.json({ success: true, count: rows.length, total: count, data: rows });
    } catch (error) { next(error); }
};

exports.getTechnicianBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const technician = await Technician.findOne({ where: { userId: req.user.id } });
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });

        const where = { technicianId: technician.id };
        if (status) where.status = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows, count } = await Booking.findAndCountAll({
            where,
            include: [{ model: User, as: 'customer', attributes: ['name', 'email', 'phone'] }],
            order: [['bookingDate', 'ASC']],
            limit: parseInt(limit), offset
        });

        res.json({ success: true, count: rows.length, total: count, data: rows });
    } catch (error) { next(error); }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: User, as: 'customer', attributes: ['name', 'email', 'phone'] },
                { model: Technician, as: 'technician', include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }] }
            ]
        });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ where: { userId: req.user.id } });
        const isCustomer = booking.customerId === req.user.id;
        const isTechnician = technician && technician.id === booking.technicianId;
        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const review = await Review.findOne({ where: { bookingId: booking.id } });
        res.json({ success: true, data: { ...booking.toJSON(), review } });
    } catch (error) { next(error); }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status, cancellationReason, finalCost, technicianNotes } = req.body;
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ where: { userId: req.user.id } });
        const isCustomer = booking.customerId === req.user.id;
        const isTechnician = technician && technician.id === booking.technicianId;

        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const validTransitions = {
            pending: ['accepted', 'cancelled'], accepted: ['in_progress', 'cancelled'],
            in_progress: ['completed', 'cancelled'], completed: [], cancelled: []
        };
        if (!validTransitions[booking.status].includes(status))
            return res.status(400).json({ message: `Cannot change status from ${booking.status} to ${status}` });

        const updates = { status };
        if (status === 'accepted') updates.acceptedAt = new Date();
        if (status === 'completed') { updates.completedAt = new Date(); if (finalCost) updates.finalCost = finalCost; }
        if (status === 'cancelled') { updates.cancelledAt = new Date(); updates.cancellationReason = cancellationReason; }
        if (technicianNotes) updates.technicianNotes = technicianNotes;

        await booking.update(updates);
        res.json({ success: true, data: booking });
    } catch (error) { next(error); }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ where: { userId: req.user.id } });
        const isCustomer = booking.customerId === req.user.id;
        const isTechnician = technician && technician.id === booking.technicianId;
        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        if (!['pending', 'accepted'].includes(booking.status))
            return res.status(400).json({ message: 'Cannot cancel this booking' });

        await booking.update({ status: 'cancelled', cancelledAt: new Date(), cancellationReason: req.body.cancellationReason });
        res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error) { next(error); }
};

exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Please provide a date' });

        const technician = await Technician.findByPk(req.params.technicianId);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        const bookings = await Booking.findAll({
            where: { technicianId: req.params.technicianId, bookingDate: date, status: { [Op.ne]: 'cancelled' } }
        });

        const bookedTimes = bookings.map(b => b.bookingTime);
        const allSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
        const slots = allSlots.map(t => ({ time: t, available: !bookedTimes.includes(t) }));

        res.json({ success: true, slots });
    } catch (error) { next(error); }
};
