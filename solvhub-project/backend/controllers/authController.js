const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Technician = require('../models/Technician');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @route POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        let { name, email, phone, password, role } = req.body;
        
        // Normalize email and phone to prevent mismatch
        email = email ? email.toLowerCase().trim() : email;
        phone = phone ? phone.trim() : phone;

        if (email && await User.findOne({ where: { email } }))
            return res.status(400).json({ message: 'User already exists with this email' });

        if (phone && await User.findOne({ where: { phone } }))
            return res.status(400).json({ message: 'User already exists with this phone number' });

        if (role && !['customer', 'technician'].includes(role))
            return res.status(400).json({ message: 'Invalid role' });

        const user = await User.create({ name, email, phone, password, role: role || 'customer' });

        if (user.role === 'technician') {
            await Technician.create({ userId: user.id, skills: [], experience: 0, serviceArea: '' });
        }

        const token = generateToken(user.id);
        res.status(201).json({
            success: true, token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

// @route POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        email = email ? email.toLowerCase().trim() : email;

        if (!email || !password)
            return res.status(400).json({ message: 'Please provide email and password' });

        // Explicitly include password and isActive in case they are hidden by default in the model scope
        const user = await User.findOne({ 
            where: { email },
            attributes: { include: ['password', 'isActive'] }
        });

        if (!user)
            return res.status(401).json({ message: 'Invalid credentials' });

        if (user.isActive === false)
            return res.status(401).json({ message: 'Your account has been deactivated' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user.id);
        res.json({
            success: true, token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (error) {
        next(error);
    }
};

// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let technicianProfile = null;
        if (user.role === 'technician') {
            technicianProfile = await Technician.findOne({ where: { userId: user.id } });
        }

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar },
            technicianProfile
        });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;
        const fields = {};
        if (name) fields.name = name.trim();
        if (phone) fields.phone = phone.trim();
        if (avatar) fields.avatar = avatar;

        await User.update(fields, { where: { id: req.user.id } });
        const user = await User.findByPk(req.user.id);

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }
        });
    } catch (error) {
        next(error);
    }
};

// @route PUT /api/auth/password
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch)
            return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully', token: generateToken(user.id) });
    } catch (error) {
        next(error);
    }
};
