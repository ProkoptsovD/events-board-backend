import pg from 'pg';
import { configDev, configProd } from './config.js';

const isProductionMode = process.env.NODE_ENV === 'production';
const config = isProductionMode ? configProd : configDev;

export const db = new pg.Pool(config);

export const connectDb = async () => {
  try {
    await db.connect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
