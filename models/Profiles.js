'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profiles.belongsTo(models.Users, {
        as: 'User',
        foreignKey: 'user_id'
      })
    }
  }
  Profiles.init({
    user_id: DataTypes.UUID,
    game_stats: DataTypes.JSONB,
    cells_highlight: DataTypes.BOOLEAN,
    numbers_highlight: DataTypes.BOOLEAN,
    highlight_color: DataTypes.STRING,
    input_mode: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Profiles',
    tableName: 'profiles'
  });
  return Profiles;
};