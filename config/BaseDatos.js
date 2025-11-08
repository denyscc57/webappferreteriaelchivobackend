const mysql = require('mysql2/promise');

function getConnectionConfig() {
  if (process.env.MYSQL_URL) {
    console.log('Usando MYSQL_URL para la conexión');
    return process.env.MYSQL_URL;
  }
  
  console.log('Usando variables individuales para la conexión');
  const config = {
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'ferreteriaelchivo',
    charset: 'utf8mb4',
    timezone: 'local',
    // Configuraciones específicas del POOL (no se pasan a conexiones)
    acquireTimeout: 60000,
    connectionLimit: 10,
    idleTimeout: 60000,       
  
  };

  // SSL configuration
  if (process.env.MYSQL_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
}

// Crear pool con configuración limpia
const pool = mysql.createPool({
  ...getConnectionConfig(),
  // Configuraciones específicas del pool (no se pasan a conexiones individuales)
  acquireTimeout: 60000,
  idleTimeout: 60000,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  maxIdle: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Probar conexión al iniciar
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a MySQL exitosamente');
    
    // Verificar la base de datos
    const [rows] = await connection.execute('SELECT DATABASE() as db_name');
    console.log(`Base de datos conectada: ${rows[0].db_name}`);
    
    connection.release();
  } catch (err) {
    console.error('Error conectando a MySQL:', err.message);
    console.log('Solución: Verifica las variables de entorno MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE');
  }
};

testConnection();

module.exports = pool;