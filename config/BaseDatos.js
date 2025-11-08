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
    ssl: { rejectUnauthorized: false } // Importante para Railway
  };
}

const conexion = mysql.createConnection(getDBConfig());

function connectToMySQL(retries = 5, delay = 5000) {
  conexion.connect((err) => {
    if (err) {
      console.error('Error conectando a MySQL:', err.message);
      console.log('Código:', err.code);
      
      if (retries > 0) {
        console.log(`Reintentando en ${delay/1000}s... (${retries} restantes)`);
        setTimeout(() => connectToMySQL(retries - 1, delay), delay);
      } else {
        console.error('No se pudo conectar después de varios intentos');
        process.exit(1);
      }
    } else {
      console.log('Conectado a MySQL exitosamente');
    }
  });
}

connectToMySQL();

conexion.on('error', (err) => {
  console.error('Error de MySQL:', err.message);
});

module.exports = conexion;