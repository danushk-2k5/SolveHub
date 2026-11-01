const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Technician = require('../models/Technician');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
});

exports.register = async (req, res, next) => {
    try {
        let { name, email, phone, password, role } = req.body;
        email = email ? email.toLowerCase().trim() : email;
        phone = phone ? phone.trim() : phone;

        if (role && !['customer', 'technician'].includes(role))
            return res.status(400).json({ message: 'Invalid role' });

        if (email && await User.exists({ email }))
            return res.status(400).json({ message: 'User already exists with this email' });
        if (phone && await User.exists({ phone }))
            return res.status(400).json({ message: 'User already exists with this phone number' });

        const user = await User.create({ name, email, phone, password, role: role || 'customer' });
        if (user.role === 'technician') {
            await Technician.create({ userId: user._id, skills: [], experience: 0, serviceArea: '' });
        }

        res.status(201).json({
            success: true,
            token: generateToken(user.id),
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        email = email ? email.toLowerCase().trim() : email;

        if (!email || !password)
            return res.status(400).json({ message: 'Please provide email and password' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.isActive)
            return res.status(401).json({ message: 'Your account has been deactivated' });

        res.json({
            success: true,
            token: generateToken(user.id),
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const technicianProfile = user.role === 'technician'
            ? await Technician.findOne({ userId: user._id })
            : null;

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
            technicianProfile
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (avatar) user.avatar = avatar;
        await user.save();

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!(await user.matchPassword(currentPassword)))
            return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully', token: generateToken(user.id) });
    } catch (error) {
        next(error);
    }
};
