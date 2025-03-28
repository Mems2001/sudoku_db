'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sudokus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sudokus.hasMany(models.Puzzles , {
        foreignKey: 'sudoku_id'
      })
    }
  }
  Sudokus.init({
    number: DataTypes.STRING,
    grid: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Sudokus',
    tableName: 'sudokus'
  });
  return Sudokus;
};