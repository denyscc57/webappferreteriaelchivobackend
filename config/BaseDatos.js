import { createPool } from 'mysql2/promise';
import {
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_USER,
    DB_PORT,
    NODE_ENV
} from './Configuracion.js';

const pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
pool.getConnection()
    .then(connection => {
        console.log('Conectado a la base de datos MySQL');
        console.log(`Base de datos: ${DB_NAME}`);
        console.log(`Entorno: ${NODE_ENV}`);
        connection.release();
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err.message);
    });

export { pool };