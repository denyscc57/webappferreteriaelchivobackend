const mysql = require('mysql2');

function getDBConfig() {
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
    ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined
  };
}

// Configuración del pool (las opciones de timeout van aquí)
const poolConfig = {
  ...getDBConfig(),
  // Opciones específicas del POOL (no de la conexión)
  acquireTimeout: 60000,
  timeout: 60000,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true
};

// Crear pool con configuración correcta
const pool = mysql.createPool(poolConfig);

// Probar la conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message);
    console.log('Código:', err.code);
    process.exit(1);
  } else {
    console.log('Conectado a MySQL exitosamente');
    connection.release(); // Liberar la conexión de prueba
  }
});

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('Error de MySQL Pool:', err.message);
});

// Manejar eventos del pool para debugging
pool.on('acquire', (connection) => {
  console.log('Conexión adquirida del pool');
});

pool.on('release', (connection) => {
  console.log('Conexión liberada al pool');
});

module.exports = pool;