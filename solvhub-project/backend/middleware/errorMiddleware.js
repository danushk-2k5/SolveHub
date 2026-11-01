const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    console.error(err);

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern || {})[0];
        message = field ? `${field} already exists` : 'Duplicate field value entered';
    }

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((error) => error.message).join(', ');
    }

    if (err.name === 'CastError' || err.name === 'BSONError') {
        statusCode = 400;
        message = 'Invalid identifier or value';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorMiddleware;
