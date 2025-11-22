import { pool } from '../config/BaseDatos.js';

const ModeloLote = {
  // Crear un nuevo lote
  crear: async (nuevoLote) => {
    const query = `
      INSERT INTO lote 
      (l_codigo, l_nombre, l_descripcion) 
      VALUES (?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      nuevoLote.codigo,
      nuevoLote.nombre,
      nuevoLote.descripcion
    ]);
    return resultados;
  },

  // Obtener todos los lotes
  obtenerTodos: async () => {
    const query = 'SELECT * FROM lote ORDER BY l_nombre';
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener lote por ID
  obtenerPorId: async (id) => {
    const query = 'SELECT * FROM lote WHERE l_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener lote por código
  obtenerPorCodigo: async (codigo) => {
    const query = 'SELECT * FROM lote WHERE l_codigo = ?';
    const [resultados] = await pool.query(query, [codigo]);
    return resultados;
  },

  // Actualizar lote
  actualizar: async (id, lote) => {
    const query = `
      UPDATE lote 
      SET l_codigo=?, l_nombre=?, l_descripcion=?
      WHERE l_id=?
    `;
    
    const [resultados] = await pool.query(query, [
      lote.codigo,
      lote.nombre,
      lote.descripcion,
      id
    ]);
    return resultados;
  },

  // Eliminar lote
  eliminar: async (id) => {
    const query = 'DELETE FROM lote WHERE l_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si código ya existe
  verificarCodigoExistente: async (codigo, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM lote WHERE l_codigo = ?';
    let params = [codigo];
    
    if (excludeId) {
      query += ' AND l_id != ?';
      params.push(excludeId);
    }
    
    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Buscar lotes por código o nombre
  buscar: async (termino) => {
    const query = `
      SELECT * FROM lote 
      WHERE (l_codigo LIKE ? OR l_nombre LIKE ? OR l_descripcion LIKE ?) 
      ORDER BY l_nombre
    `;
    const terminoBusqueda = `%${termino}%`;
    const [resultados] = await pool.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda]);
    return resultados;
  },

  // Obtener estadísticas de lotes
  obtenerEstadisticas: async () => {
    const query = `
      SELECT 
        COUNT(*) as total,
        (SELECT COUNT(*) FROM producto WHERE p_loteFK = lote.l_id) as productos_asociados
      FROM lote
      GROUP BY l_id
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener lotes con conteo de productos
  obtenerLotesConProductos: async () => {
    const query = `
      SELECT l.*, COUNT(p.p_id) as total_productos
      FROM lote l
      LEFT JOIN producto p ON l.l_id = p.p_loteFK
      GROUP BY l.l_id
      ORDER BY l.l_nombre
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Verificar productos asociados
  verificarProductosAsociados: async (id) => {
    const query = 'SELECT COUNT(*) as count FROM producto WHERE p_loteFK = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  }
};

export default ModeloLote;