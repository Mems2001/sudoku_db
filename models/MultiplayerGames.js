'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MultiplayerGames extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MultiplayerGames.hasMany(models.Players , {
        foreignKey: 'game_id'
      })
      MultiplayerGames.belongsTo(models.Sudokus , {
        foreignKey: 'sudoku_id',
        as: 'Sudoku'
      })
      MultiplayerGames.belongsTo(models.Puzzles , {
        foreignKey: 'puzzle_id',
        as: 'Puzzle'
      })
    }
  }
  MultiplayerGames.init({
    sudokuId: DataTypes.UUID,
    puzzleId: DataTypes.UUID,
    number: DataTypes.STRING,
    grid: DataTypes.JSON,
    status: DataTypes.INTEGER,
    time: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MultiplayerGames',
    tableName: 'multiplayer_games'
  });
  return MultiplayerGames;
};