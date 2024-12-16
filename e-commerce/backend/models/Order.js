const { DataTypes } = require('sequelize');
const sequelize = require('./index').sequelize;

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: sequelize.User,
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'canceled'),
    defaultValue: 'pending',
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
});

module.exports = Order;