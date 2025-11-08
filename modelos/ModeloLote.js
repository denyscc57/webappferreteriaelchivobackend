const db = require('../config/BaseDatos');

const ModeloLote = {
  // Crear un nuevo lote
  crear: (nuevoLote, callback) => {
    const query = `
      INSERT INTO lote 
      (l_codigo, l_nombre, l_descripcion) 
      VALUES (?, ?, ?)
    `;
    
    db.query(query, [
      nuevoLote.codigo,
      nuevoLote.nombre,
      nuevoLote.descripcion
    ], callback);
  },

  // Obtener todos los lotes
  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM lote ORDER BY l_codigo ASC';
    db.query(query, callback);
  },

  // Obtener lote por ID
  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM lote WHERE l_id = ? ORDER BY l_codigo ASC';
    db.query(query, [id], callback);
  },
  

  // Obtener lote por código
  obtenerPorCodigo: (codigo, callback) => {
    const query = 'SELECT * FROM lote WHERE l_codigo = ? ORDER BY l_codigo ASC';
    db.query(query, [codigo], callback);
  },

  // Actualizar lote
  actualizar: (id, lote, callback) => {
    const query = `
      UPDATE lote 
      SET l_codigo=?, l_nombre=?, l_descripcion=?
      WHERE l_id=?
    `;
    
    db.query(query, [
      lote.codigo,
      lote.nombre,
      lote.descripcion,
      id
    ], callback);
  },

  // Eliminar lote
  eliminar: (id, callback) => {
    const query = 'DELETE FROM lote WHERE l_id = ?';
    db.query(query, [id], callback);
  },

  // Verificar si código ya existe
  verificarCodigoExistente: (codigo, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM lote WHERE l_codigo = ?';
    let params = [codigo];
    
    if (excludeId) {
      query += ' AND l_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Buscar lotes por código o nombre
  buscar: (termino, callback) => {
    const query = `
      SELECT * FROM lote 
      WHERE (l_codigo LIKE ? OR l_nombre LIKE ? OR l_descripcion LIKE ?) 
      ORDER BY l_nombre
    `;
    const terminoBusqueda = `%${termino}%`;
    db.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda], callback);
  },

  // Obtener estadísticas de lotes
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        (SELECT COUNT(*) FROM producto WHERE p_loteFK = lote.l_id) as productos_asociados
      FROM lote
      GROUP BY l_id
    `;
    db.query(query, callback);
  },

  // Obtener lotes con conteo de productos
  obtenerLotesConProductos: (callback) => {
    const query = `
      SELECT l.*, COUNT(p.p_id) as total_productos
      FROM lote l
      LEFT JOIN producto p ON l.l_id = p.p_loteFK
      GROUP BY l.l_id
      ORDER BY l.l_nombre
    `;
    db.query(query, callback);
  }, 
   verificarProductosAsociados: (id, callback) => {
    const query = 'SELECT COUNT(*) as count FROM producto WHERE p_loteFK = ?';
    db.query(query, [id], callback);
  },
  
};

module.exports = ModeloLote;