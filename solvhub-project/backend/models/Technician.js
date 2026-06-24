const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Technician = sequelize.define('Technician', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: User, key: 'id' } },
    skills: { type: DataTypes.TEXT, defaultValue: '[]', get() { return JSON.parse(this.getDataValue('skills') || '[]'); }, set(val) { this.setDataValue('skills', JSON.stringify(val)); } },
    experience: { type: DataTypes.INTEGER, defaultValue: 0 },
    bio: { type: DataTypes.TEXT },
    serviceArea: { type: DataTypes.STRING, defaultValue: '' },
    latitude: { type: DataTypes.FLOAT, defaultValue: 0 },
    longitude: { type: DataTypes.FLOAT, defaultValue: 0 },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    hourlyRate: { type: DataTypes.FLOAT, defaultValue: 0 },
    profilePhoto: { type: DataTypes.STRING, defaultValue: '' }
}, { timestamps: true });

Technician.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Technician, { foreignKey: 'userId' });

module.exports = Technician;
