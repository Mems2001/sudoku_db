'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameSettings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GameSettings.belongsTo(models.Users , {
        as: 'User',
        foreignKey: 'user_id'
      })
    }
  }
  GameSettings.init({
    userId: DataTypes.UUID,
    cellsHighlight: DataTypes.BOOLEAN,
    numbersHighlight: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'GameSettings',
    tableName: 'game_settings'
  });
  return GameSettings;
};