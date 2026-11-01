const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    let decoded;
    try {
        const token = req.headers.authorization.split(' ')[1];
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    try {
        req.user = await User.findById(decoded.id);
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        if (!req.user.isActive) return res.status(401).json({ message: 'User account is deactivated' });
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { protect };
