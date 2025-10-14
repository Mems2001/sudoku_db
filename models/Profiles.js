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
        as: 'Profile',
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
    // games_started: DataTypes.INTEGER,
    // games_won: DataTypes.INTEGER,
    // games_lost: DataTypes.INTEGER,
    // games_restarted: DataTypes.INTEGER,
    // win_ratio: DataTypes.DOUBLE,
    // total_errors: DataTypes.INTEGER,
    // error_ratio: DataTypes.DOUBLE,
    // time_played: DataTypes.INTEGER,
    // time_per_game: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Profiles',
    tableName: 'profiles'
  });
  return Profiles;
};