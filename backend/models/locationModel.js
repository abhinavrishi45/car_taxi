const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Location = sequelize.define('Location', {
  name: { type: DataTypes.STRING, allowNull: false },
  lat: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
  lng: { type: DataTypes.DECIMAL(10, 6), allowNull: false },
  address: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'locations',
});

module.exports = Location;
