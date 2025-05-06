'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Puzzles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Puzzles.belongsTo(models.Sudokus , {
        foreignKey: 'sudoku_id',
        as: 'Sudoku'
      })
      Puzzles.hasMany(models.Games , {
        foreignKey: 'puzzle_id'
      })
    }
  }
  Puzzles.init({
    sudokuId: DataTypes.UUID,
    number: DataTypes.STRING,
    grid: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Puzzles',
    tableName: 'puzzles'
  });
  return Puzzles;
};