require('dotenv').config();

module.exports = 
{
  "api": {jwtSecret : process.env.JWT_SECRET},
  "development": {
    "username": process.env.DB_USER_LOCAL,
    "password": process.env.DB_PASS_LOCAL,
    "database": process.env.DB_NAME_LOCAL,
    "host": process.env.DB_HOST_LOCAL,
    "dialect": "postgres",
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt:'created_at',
      updatedAt:'updated_at',
      deletedAt:'deleted_at',
    },
    dialectOptions: {
      useUTC: true,
    },
    timezone: 'UTC'
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "api": {jwtSecret : process.env.JWT_SECRET},
    "username": process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt:'created_at',
      updatedAt:'updated_at',
      deletedAt:'deleted_at',
    },
    dialectOptions: {
      useUTC: true,
    },
    timezone: 'UTC'
  }
}
