'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Permission.belongsToMany(models.Role, {through: 'RolePermission'});

    }
  }
  Permission.init({
    name: DataTypes.STRING,
    display_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Permissions',
    tableName: 'permissions'
  });
  return Permission;
};