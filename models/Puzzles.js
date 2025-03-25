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
    }
  }
  Puzzles.init({
    sudokuId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'Puzzles',
    tableName: 'puzzles'
  });
  return Puzzles;
};