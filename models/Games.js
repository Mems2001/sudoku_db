'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Games extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Games.belongsTo(models.Puzzles , {
        foreignKey: 'puzzle_id',
        as: 'Puzzle'
      })
    }
  }
  Games.init({
    type: DataTypes.INTEGER,
    puzzleId: DataTypes.UUID,
    status: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    // attempts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Games',
    tableName: 'games'
  });
  return Games;
};