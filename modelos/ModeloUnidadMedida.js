const db = require('../config/BaseDatos');

const ModeloUnidadMedida = {
  // Crear una nueva unidad de medida
  crear: (nuevaUnidad, callback) => {
    const query = 'INSERT INTO unidadmedida (m_unidad) VALUES (?)';
    db.query(query, [nuevaUnidad.unidad], callback);
  },

  // Obtener todas las unidades de medida
  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM unidadmedida ORDER BY m_id ASC';
    db.query(query, callback);
  },

  // Obtener unidad de medida por ID
  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM unidadmedida WHERE m_id = ?';
    db.query(query, [id], callback);
  },

  // Actualizar unidad de medida
  actualizar: (id, unidad, callback) => {
    const query = 'UPDATE unidadmedida SET m_unidad = ? WHERE m_id = ?';
    db.query(query, [unidad.unidad, id], callback);
  },

  // Eliminar unidad de medida (solo si no está siendo usada)
  eliminar: (id, callback) => {
    // Verificar si la unidad está siendo usada en productos
    const verificarQuery = 'SELECT COUNT(*) as count FROM producto WHERE p_unidadmedidaFK = ?';
    
    db.query(verificarQuery, [id], (err, resultados) => {
      if (err) {
        return callback(err);
      }
      
      if (resultados[0].count > 0) {
        return callback(new Error('No se puede eliminar la unidad porque está siendo utilizada en productos'));
      }
      
      // Si no está siendo usada, proceder con la eliminación
      const deleteQuery = 'DELETE FROM unidadmedida WHERE m_id = ?';
      db.query(deleteQuery, [id], callback);
    });
  },

  // Buscar unidades de medida
  buscar: (termino, callback) => {
    const query = 'SELECT * FROM unidadmedida WHERE m_unidad LIKE ? ORDER BY m_unidad';
    const terminoBusqueda = `%${termino}%`;
    db.query(query, [terminoBusqueda], callback);
  },

  // Verificar si unidad ya existe
  verificarUnidadExistente: (unidad, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM unidadmedida WHERE m_unidad = ?';
    let params = [unidad];
    
    if (excludeId) {
      query += ' AND m_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  }
};

module.exports = ModeloUnidadMedida;