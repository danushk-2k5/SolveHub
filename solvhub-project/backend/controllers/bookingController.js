const Booking = require('../models/Booking');
const Technician = require('../models/Technician');
const Review = require('../models/Review');

const pagination = (page, limit) => ({
    page: Math.max(1, Number.parseInt(page, 10) || 1),
    limit: Math.max(1, Number.parseInt(limit, 10) || 10)
});

const idOf = (value) => String(value?._id || value);

const populateTechnician = (query) => query
    .populate({
        path: 'technicianId',
        populate: [
            { path: 'userId', select: 'name email phone avatar' },
            { path: 'user', select: 'name email phone avatar' }
        ]
    })
    .populate({
        path: 'technician',
        populate: [
            { path: 'userId', select: 'name email phone avatar' },
            { path: 'user', select: 'name email phone avatar' }
        ]
    });

exports.createBooking = async (req, res, next) => {
    try {
        const { technicianId, serviceType, description, bookingDate, bookingTime, address, estimatedCost } = req.body;
        const technician = await Technician.findById(technicianId);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        if (!technician.isAvailable) return res.status(400).json({ message: 'Technician is not available' });

        const booking = await Booking.create({
            customerId: req.user.id, technicianId, serviceType, description,
            bookingDate, bookingTime, address, estimatedCost: estimatedCost || technician.hourlyRate
        });
        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.getCustomerBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const { page, limit } = pagination(req.query.page, req.query.limit);
        const query = { customerId: req.user.id, ...(status ? { status } : {}) };
        const [rows, total] = await Promise.all([
            populateTechnician(Booking.find(query))
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Booking.countDocuments(query)
        ]);
        res.json({ success: true, count: rows.length, total, data: rows });
    } catch (error) {
        next(error);
    }
};

exports.getTechnicianBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const { page, limit } = pagination(req.query.page, req.query.limit);
        const technician = await Technician.findOne({ userId: req.user.id });
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });

        const query = { technicianId: technician._id, ...(status ? { status } : {}) };
        const [rows, total] = await Promise.all([
            Booking.find(query)
                .populate('customerId', 'name email phone')
                .populate('customer', 'name email phone')
                .sort({ bookingDate: 1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Booking.countDocuments(query)
        ]);
        res.json({ success: true, count: rows.length, total, data: rows });
    } catch (error) {
        next(error);
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await populateTechnician(Booking.findById(req.params.id))
            .populate('customerId', 'name email phone')
            .populate('customer', 'name email phone');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ userId: req.user.id });
        const isCustomer = idOf(booking.customerId) === req.user.id;
        const isTechnician = technician && idOf(technician._id) === idOf(booking.technicianId);
        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const review = await Review.findOne({ bookingId: booking._id });
        res.json({ success: true, data: { ...booking.toJSON(), review } });
    } catch (error) {
        next(error);
    }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status, cancellationReason, finalCost, technicianNotes } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ userId: req.user.id });
        const isCustomer = idOf(booking.customerId) === req.user.id;
        const isTechnician = technician && idOf(technician._id) === idOf(booking.technicianId);
        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const validTransitions = {
            pending: ['accepted', 'cancelled'],
            accepted: ['in_progress', 'cancelled'],
            in_progress: ['completed', 'cancelled'],
            completed: [],
            cancelled: []
        };
        if (!validTransitions[booking.status].includes(status))
            return res.status(400).json({ message: `Cannot change status from ${booking.status} to ${status}` });

        booking.status = status;
        if (status === 'accepted') booking.acceptedAt = new Date();
        if (status === 'completed') {
            booking.completedAt = new Date();
            if (finalCost) booking.finalCost = finalCost;
        }
        if (status === 'cancelled') {
            booking.cancelledAt = new Date();
            booking.cancellationReason = cancellationReason;
        }
        if (technicianNotes) booking.technicianNotes = technicianNotes;

        await booking.save();
        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const technician = await Technician.findOne({ userId: req.user.id });
        const isCustomer = idOf(booking.customerId) === req.user.id;
        const isTechnician = technician && idOf(technician._id) === idOf(booking.technicianId);
        if (!isCustomer && !isTechnician && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });
        if (!['pending', 'accepted'].includes(booking.status))
            return res.status(400).json({ message: 'Cannot cancel this booking' });

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancellationReason = req.body.cancellationReason;
        await booking.save();
        res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error) {
        next(error);
    }
};

exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Please provide a date' });

        const technician = await Technician.findById(req.params.technicianId);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        const bookings = await Booking.find({
            technicianId: technician._id,
            bookingDate: date,
            status: { $ne: 'cancelled' }
        }).select('bookingTime');

        const bookedTimes = bookings.map((booking) => booking.bookingTime);
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const slots = allSlots.map((time) => ({ time, available: !bookedTimes.includes(time) }));
        res.json({ success: true, slots });
    } catch (error) {
        next(error);
    }
};
