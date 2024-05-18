const dotenv = require('dotenv');

dotenv.config();

const configDev = {
  host: 'localhost',
  user: 'root',
  port: 5432,
  password: 'secret',
  database: 'postgres',
};

const configProd = {
  host: process.env.DB_HOST || '',
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};

module.exports = {
  configDev,
  configProd,
};
