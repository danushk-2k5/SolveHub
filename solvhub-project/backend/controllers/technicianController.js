const Technician = require('../models/Technician');

const pagination = (page, limit) => ({
    page: Math.max(1, Number.parseInt(page, 10) || 1),
    limit: Math.max(1, Number.parseInt(limit, 10) || 10)
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getTechnicians = async (req, res, next) => {
    try {
        const { skill } = req.query;
        const { page, limit } = pagination(req.query.page, req.query.limit);
        const query = skill ? { skills: { $regex: escapeRegex(skill), $options: 'i' } } : {};
        const [technicians, total] = await Promise.all([
            Technician.find(query)
                .populate('userId', 'name email phone avatar')
                .populate('user', 'name email phone avatar')
                .sort({ rating: -1, totalReviews: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Technician.countDocuments(query)
        ]);

        res.json({ success: true, count: technicians.length, total, data: technicians });
    } catch (error) {
        next(error);
    }
};

exports.getTechnician = async (req, res, next) => {
    try {
        const technician = await Technician.findById(req.params.id)
            .populate('userId', 'name email phone avatar')
            .populate('user', 'name email phone avatar');
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        res.json({ success: true, data: technician });
    } catch (error) {
        next(error);
    }
};

exports.createTechnician = async (req, res, next) => {
    try {
        const existing = await Technician.exists({ userId: req.user.id });
        if (existing) return res.status(400).json({ message: 'Technician profile already exists' });

        const { skills, experience, bio, serviceArea, hourlyRate } = req.body;
        const technician = await Technician.create({
            userId: req.user.id, skills, experience, bio, serviceArea, hourlyRate
        });
        res.status(201).json({ success: true, data: technician });
    } catch (error) {
        next(error);
    }
};

exports.updateTechnician = async (req, res, next) => {
    try {
        const technician = await Technician.findById(req.params.id);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        if (String(technician.userId) !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });

        const { skills, experience, bio, serviceArea, isAvailable, hourlyRate, profilePhoto } = req.body;
        const updates = { skills, experience, bio, serviceArea, isAvailable, hourlyRate, profilePhoto };
        for (const [field, value] of Object.entries(updates)) {
            if (value !== undefined) technician[field] = value;
        }
        await technician.save();
        res.json({ success: true, data: technician });
    } catch (error) {
        next(error);
    }
};

exports.getMyProfile = async (req, res, next) => {
    try {
        const technician = await Technician.findOne({ userId: req.user.id })
            .populate('userId', 'name email phone avatar')
            .populate('user', 'name email phone avatar');
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
        res.json({ success: true, data: technician });
    } catch (error) {
        next(error);
    }
};

exports.updateAvailability = async (req, res, next) => {
    try {
        const technician = await Technician.findOne({ userId: req.user.id });
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
        technician.isAvailable = req.body.isAvailable;
        await technician.save();
        res.json({ success: true, data: { isAvailable: technician.isAvailable } });
    } catch (error) {
        next(error);
    }
};
