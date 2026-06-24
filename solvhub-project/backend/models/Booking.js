const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Technician = require('./Technician');

const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
    technicianId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Technician, key: 'id' } },
    serviceType: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
    bookingTime: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled'), defaultValue: 'pending' },
    estimatedCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    finalCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    cancellationReason: { type: DataTypes.STRING },
    acceptedAt: { type: DataTypes.DATE },
    completedAt: { type: DataTypes.DATE },
    cancelledAt: { type: DataTypes.DATE },
    technicianNotes: { type: DataTypes.TEXT }
}, { timestamps: true });

Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });
Booking.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });

module.exports = Booking;
