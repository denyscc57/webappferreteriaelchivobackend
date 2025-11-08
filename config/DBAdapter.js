const db = require('./BaseDatos');

/**
 * Adaptador para mantener compatibilidad con los modelos existentes
 * Ahora usando promesas pero manteniendo interfaz de callbacks
 */
const DBAdapter = {
  /**
   * Ejecuta una consulta usando el pool de conexiones
   * @param {string} query - Consulta SQL
   * @param {Array} params - Parámetros para la consulta
   * @param {Function} callback - Callback (error, results) - OPCIONAL
   */
  query: (query, params, callback) => {
    // Si no hay parámetros, ajustar para el callback
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // Si se proporciona callback, usar modo callback
    if (callback) {
      db.getConnection()
        .then(connection => {
          return connection.execute(query, params || [])
            .then(([results, fields]) => {
              connection.release();
              callback(null, results);
            })
            .catch(error => {
              connection.release();
              console.error('Error en consulta:', error);
              callback(error, null);
            });
        })
        .catch(err => {
          console.error('Error obteniendo conexión del pool:', err);
          callback(err, null);
        });
    } else {
      // Si no hay callback, retornar promesa
      return db.execute(query, params || [])
        .then(([results, fields]) => results)
        .catch(error => {
          console.error('Error en consulta:', error);
          throw error;
        });
    }
  },
  
  /**
   * Para compatibilidad con código existente que usa db.connect()
   */
  connect: (callback) => {
    db.getConnection()
      .then(connection => {
        connection.release();
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },
  
  /**
   * NUEVO: Método para usar promesas directamente
   */
  execute: (query, params = []) => {
    return db.execute(query, params)
      .then(([results, fields]) => results)
      .catch(error => {
        console.error('Error en execute:', error);
        throw error;
      });
  },
  
  /**
   * NUEVO: Método para transacciones
   */
  transaction: async (callback) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = DBAdapter;