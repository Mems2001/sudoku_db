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
      Games.belongsTo(models.Sudokus , {
        foreignKey: 'sudoku_id',
        as: 'Sudoku'
      })
      Games.belongsTo(models.Puzzles , {
        foreignKey: 'puzzle_id',
        as: 'Puzzle'
      })
      Games.belongsTo(models.Users , {
        foreignKey: 'user_id',
        as: 'User'
      })
    }
  }
  Games.init({
    userId: DataTypes.UUID,
    sudokuId: DataTypes.UUID,
    puzzleId: DataTypes.UUID,
    number: DataTypes.STRING,
    grid: DataTypes.JSON,
    status: DataTypes.INTEGER,
    errors: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    // attempts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Games',
    tableName: 'games'
  });
  return Games;
};