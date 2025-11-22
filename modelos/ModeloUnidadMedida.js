import { pool } from '../config/BaseDatos.js';

const ModeloUnidadMedida = {
  // Crear una nueva unidad de medida
  crear: async (nuevaUnidad) => {
    const query = 'INSERT INTO unidadmedida (m_unidad) VALUES (?)';
    const [resultados] = await pool.query(query, [nuevaUnidad.unidad]);
    return resultados;
  },

  // Obtener todas las unidades de medida
  obtenerTodos: async () => {
    const query = 'SELECT * FROM unidadmedida ORDER BY m_id ASC';
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener unidad de medida por ID
  obtenerPorId: async (id) => {
    const query = 'SELECT * FROM unidadmedida WHERE m_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Actualizar unidad de medida
  actualizar: async (id, unidad) => {
    const query = 'UPDATE unidadmedida SET m_unidad = ? WHERE m_id = ?';
    const [resultados] = await pool.query(query, [unidad.unidad, id]);
    return resultados;
  },

  // Eliminar unidad de medida (solo si no está siendo usada)
  eliminar: async (id) => {
    // Verificar si la unidad está siendo usada en productos
    const verificarQuery = 'SELECT COUNT(*) as count FROM producto WHERE p_unidadmedidaFK = ?';
    
    const [resultadosVerificacion] = await pool.query(verificarQuery, [id]);
    
    if (resultadosVerificacion[0].count > 0) {
      throw new Error('No se puede eliminar la unidad porque está siendo utilizada en productos');
    }
    
    // Si no está siendo usada, proceder con la eliminación
    const deleteQuery = 'DELETE FROM unidadmedida WHERE m_id = ?';
    const [resultados] = await pool.query(deleteQuery, [id]);
    return resultados;
  },

  // Buscar unidades de medida
  buscar: async (termino) => {
    const query = 'SELECT * FROM unidadmedida WHERE m_unidad LIKE ? ORDER BY m_unidad';
    const terminoBusqueda = `%${termino}%`;
    const [resultados] = await pool.query(query, [terminoBusqueda]);
    return resultados;
  },

  // Verificar si unidad ya existe
  verificarUnidadExistente: async (unidad, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM unidadmedida WHERE m_unidad = ?';
    let params = [unidad];
    
    if (excludeId) {
      query += ' AND m_id != ?';
      params.push(excludeId);
    }
    
    const [resultados] = await pool.query(query, params);
    return resultados;
  }
};

export default ModeloUnidadMedida;