'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reservation.belongsTo(models.Room, {foreignKey: 'roomId'})
      Reservation.belongsTo(models.User, {foreignKey: 'userId'})
      Reservation.belongsTo(models.Customer, {foreignKey: 'customerId'})
    }
  }
  Reservation.init({
    checkIn: DataTypes.DATE,
    checkOut: DataTypes.DATE,
    roomId: DataTypes.INTEGER,
    hallId:DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    booking_date: DataTypes.DATE,
    payment_status: DataTypes.STRING,
    adults_number:DataTypes.INTEGER,
    children_number:DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'Reservations'
  });
  return Reservation;
};