import fs from 'fs';

export const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/api';
export const MULTER_PATH: string = process.env.MULTER_PATH || 'public/';
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
export const HOST: string = process.env.HOST || '127.0.0.1';
export const TOKEN_EXP: number = parseInt(process.env.TOKEN_EXP || '86400'); //in msec

export const YUGIOH_URL: string = process.env.YUGIOH_URL || 'http://localhost:5000/api';

export const PUB_KEY:string = fs.readFileSync('.keys/public.key', 'utf-8');
export const PRIV_KEY: string = fs.readFileSync('.keys/private.key', 'utf-8');