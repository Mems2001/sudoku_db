'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Players extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Players.belongsTo(models.Users , {
        foreignKey: 'user_id',
        as: 'User'
      })
      Players.belongsTo(models.Games , {
        foreignKey: 'game_id',
        as: 'Game'
      })
    }
  }
  Players.init({
    user_id: DataTypes.UUID,
    game_id: DataTypes.UUID,
    grid: DataTypes.JSON,
    number: DataTypes.STRING,
    annotations: DataTypes.JSON,
    errors: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    attempts: DataTypes.INTEGER,
    isConnected: DataTypes.BOOLEAN,
    host: DataTypes.BOOLEAN,
    show: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Players',
    tableName: 'players'
  });
  return Players;
};