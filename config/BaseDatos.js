const mysql = require('mysql2/promise');

function getConnectionConfig() {
  if (process.env.MYSQL_URL) {
    console.log('Usando MYSQL_URL para la conexión');
    return process.env.MYSQL_URL;
  }
  
  console.log('Usando variables individuales para la conexión');
  return {
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'ferreteriaelchivo',
    ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined,
    charset: 'utf8mb4',
    timezone: 'local'
  };
}

// Configuración base de la conexión
const connectionConfig = getConnectionConfig();

// Configuración del POOL (separada)
const poolConfig = {
  ...connectionConfig,
  // Opciones específicas del POOL
  acquireTimeout: 60000,
  connectTimeout: 60000,
  idleTimeout: 60000,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  maxIdle: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Crear pool con promesas
const pool = mysql.createPool(poolConfig);

// Función para probar conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL exitosamente');
    console.log(`Base de datos: ${connectionConfig.database}`);
    console.log(`Host: ${connectionConfig.host}:${connectionConfig.port}`);
    connection.release();
    return true;
  } catch (err) {
    console.error('Error conectando a MySQL:', err.message);
    console.log(' Código:', err.code);
    console.log(' Verifica las credenciales y la conexión a la base de datos');
    return false;
  }
};

// Probar conexión al iniciar
testConnection();

// Manejar eventos del pool
pool.on('acquire', (connection) => {
  console.log('Conexión adquirida del pool');
});

pool.on('release', (connection) => {
  console.log(' Conexión liberada al pool');
});

pool.on('error', (err) => {
  console.error('Error de MySQL Pool:', err.message);
});

module.exports = pool;