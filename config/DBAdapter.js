const db = require('./BaseDatos');

/**
 * Adaptador para mantener compatibilidad con los modelos existentes
 * Convierte las llamadas de conexión directa a uso de pool
 */
const DBAdapter = {
  /**
   * Ejecuta una consulta usando el pool de conexiones
   * @param {string} query - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @param {Function} callback - Callback (error, results)
   */
  query: (query, params, callback) => {
    // Si no hay parámetros, ajustar para el callback
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    db.getConnection((err, connection) => {
      if (err) {
        console.error('Error obteniendo conexión del pool:', err);
        return callback(err, null);
      }
      
      connection.query(query, params || [], (error, results) => {
        // Siempre liberar la conexión
        connection.release();
        
        if (error) {
          console.error('Error en consulta:', error);
          return callback(error, null);
        }
        
        callback(null, results);
      });
    });
  },
  
  /**
   * Para compatibilidad con código existente que usa db.connect()
   */
  connect: (callback) => {
    db.getConnection((err, connection) => {
      if (err) {
        return callback(err);
      }
      connection.release();
      callback(null);
    });
  }
};

module.exports = DBAdapter;