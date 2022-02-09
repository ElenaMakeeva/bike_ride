'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Way, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      }),
      User.hasMany(models.Comment, { 
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      }),
      User.hasOne(models.UserInfo, { 
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      })
    }
  }
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
