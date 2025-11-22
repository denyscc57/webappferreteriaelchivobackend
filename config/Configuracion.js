import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
export const DB_NAME = process.env.DB_NAME || 'ferreteriaelchivo2';
export const DB_PORT = process.env.DB_PORT || 3306;

// Configuración para JWT
export const JWT_SECRET = process.env.JWT_SECRET || '12345';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Configuración CORS
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';