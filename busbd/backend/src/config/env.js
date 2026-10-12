require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'busbd_super_secret_key_2024_change_in_production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
