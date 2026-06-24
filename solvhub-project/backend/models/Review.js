const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Technician = require('./Technician');
const Booking = require('./Booking');

const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    technicianId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Technician, key: 'id' } },
    bookingId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: Booking, key: 'id' } },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: false }
}, { timestamps: true });

Review.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Review.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });
Review.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Recalculate technician rating after review save
Review.afterCreate(async (review) => {
    const { fn, col } = require('sequelize');
    const result = await Review.findOne({
        where: { technicianId: review.technicianId },
        attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'total']]
    });
    await Technician.update(
        { rating: parseFloat(result.dataValues.avgRating).toFixed(1), totalReviews: result.dataValues.total },
        { where: { id: review.technicianId } }
    );
});

module.exports = Review;
