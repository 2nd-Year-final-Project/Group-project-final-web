const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PendingUser = sequelize.define('PendingUser', {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    idPhoto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    timestamps: true,
    tableName: 'pending_users'
});

module.exports = PendingUser;