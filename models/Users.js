'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.hasMany(models.Players , {
        foreignKey: 'user_id'
      })
      Users.belongsTo(models.Roles , {
        foreignKey: 'role_id',
        as: 'Role'
      })
    }
  }
  Users.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    roleId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users'
  });
  return Users;
};