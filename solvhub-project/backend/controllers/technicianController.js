const { Op } = require('sequelize');
const Technician = require('../models/Technician');
const User = require('../models/User');

exports.getTechnicians = async (req, res, next) => {
    try {
        const { skill, page = 1, limit = 10 } = req.query;
        const where = {}; // show all technicians, not just available

        if (skill) {
            where.skills = { [Op.like]: `%${skill}%` };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows: technicians, count } = await Technician.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }],
            order: [['rating', 'DESC'], ['totalReviews', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({ success: true, count: technicians.length, total: count, data: technicians });
    } catch (error) { next(error); }
};

exports.getTechnician = async (req, res, next) => {
    try {
        const technician = await Technician.findByPk(req.params.id, {
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }]
        });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        res.json({ success: true, data: technician });
    } catch (error) { next(error); }
};

exports.createTechnician = async (req, res, next) => {
    try {
        const existing = await Technician.findOne({ where: { userId: req.user.id } });
        if (existing) return res.status(400).json({ message: 'Technician profile already exists' });

        const { skills, experience, bio, serviceArea, hourlyRate } = req.body;
        const technician = await Technician.create({ userId: req.user.id, skills, experience, bio, serviceArea, hourlyRate });
        res.status(201).json({ success: true, data: technician });
    } catch (error) { next(error); }
};

exports.updateTechnician = async (req, res, next) => {
    try {
        const technician = await Technician.findByPk(req.params.id);
        if (!technician) return res.status(404).json({ message: 'Technician not found' });
        if (technician.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const { skills, experience, bio, serviceArea, isAvailable, hourlyRate, profilePhoto } = req.body;
        await technician.update({ skills, experience, bio, serviceArea, isAvailable, hourlyRate, profilePhoto });
        res.json({ success: true, data: technician });
    } catch (error) { next(error); }
};

exports.getMyProfile = async (req, res, next) => {
    try {
        const technician = await Technician.findOne({
            where: { userId: req.user.id },
            include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }]
        });
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
        res.json({ success: true, data: technician });
    } catch (error) { next(error); }
};

exports.updateAvailability = async (req, res, next) => {
    try {
        const technician = await Technician.findOne({ where: { userId: req.user.id } });
        if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
        await technician.update({ isAvailable: req.body.isAvailable });
        res.json({ success: true, data: { isAvailable: technician.isAvailable } });
    } catch (error) { next(error); }
};
