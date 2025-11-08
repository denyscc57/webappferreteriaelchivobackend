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
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    ssl: process.env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined
  };
}

// Crear pool en lugar de conexión única
const pool = mysql.createPool(getDBConfig());

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

module.exports = pool;