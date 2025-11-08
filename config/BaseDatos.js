const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // Configuraciones básicas de conexión
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  charset: 'utf8mb4',
  
  // Configuraciones específicas del POOL (no se pasan a conexiones)
  acquireTimeout: 60000,       
  connectionLimit: 10,            
  idleTimeout: 60000,     
});

module.exports = pool;