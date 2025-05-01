import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const nodeEnv = process.env.NODE_ENV || 'development';
export const mongoDBUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

