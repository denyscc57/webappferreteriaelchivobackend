import { pool } from '../config/BaseDatos.js';

const ModeloProveedor = {
  // Crear un nuevo proveedor
  crear: async (nuevoProveedor) => {
    const query = `
      INSERT INTO proveedor 
      (pr_nombres, pr_apellidos, pr_identificacion, pr_email, pr_ciudad, pr_direccion, pr_celular, pr_tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      nuevoProveedor.nombres,
      nuevoProveedor.apellidos,
      nuevoProveedor.identificacion,
      nuevoProveedor.email,
      nuevoProveedor.ciudad,
      nuevoProveedor.direccion,
      nuevoProveedor.celular,
      nuevoProveedor.tipo || 1
    ]);
    return resultados;
  },

  // Obtener todos los proveedores activos
  obtenerTodos: async () => {
    const query = 'SELECT * FROM proveedor WHERE pr_activo = TRUE ORDER BY pr_nombres, pr_apellidos';
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener proveedor por ID
  obtenerPorId: async (id) => {
    const query = 'SELECT * FROM proveedor WHERE pr_id = ? AND pr_activo = TRUE';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener proveedor por identificación
  obtenerPorIdentificacion: async (identificacion) => {
    const query = 'SELECT * FROM proveedor WHERE pr_identificacion = ? AND pr_activo = TRUE';
    const [resultados] = await pool.query(query, [identificacion]);
    return resultados;
  },

  // Actualizar proveedor
  actualizar: async (id, proveedor) => {
    const query = `
      UPDATE proveedor 
      SET pr_nombres=?, pr_apellidos=?, pr_identificacion=?, pr_email=?, 
          pr_ciudad=?, pr_direccion=?, pr_celular=?, pr_tipo=?
      WHERE pr_id=? AND pr_activo = TRUE
    `;
    
    const [resultados] = await pool.query(query, [
      proveedor.nombres,
      proveedor.apellidos,
      proveedor.identificacion,
      proveedor.email,
      proveedor.ciudad,
      proveedor.direccion,
      proveedor.celular,
      proveedor.tipo,
      id
    ]);
    return resultados;
  },

  // Eliminar proveedor (desactivar)
  eliminar: async (id) => {
    const query = 'UPDATE proveedor SET pr_activo = FALSE WHERE pr_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Reactivar proveedor
  reactivar: async (id) => {
    const query = 'UPDATE proveedor SET pr_activo = TRUE WHERE pr_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si identificación ya existe
  verificarIdentificacionExistente: async (identificacion, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM proveedor WHERE pr_identificacion = ? AND pr_activo = TRUE';
    let params = [identificacion];
    
    if (excludeId) {
      query += ' AND pr_id != ?';
      params.push(excludeId);
    }
    
    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Buscar proveedores por nombre, apellido o identificación
  buscar: async (termino) => {
    const query = `
      SELECT * FROM proveedor 
      WHERE (pr_nombres LIKE ? OR pr_apellidos LIKE ? OR pr_identificacion LIKE ?) 
      AND pr_activo = TRUE 
      ORDER BY pr_nombres, pr_apellidos
    `;
    const terminoBusqueda = `%${termino}%`;
    const [resultados] = await pool.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda]);
    return resultados;
  },

  // Obtener proveedores por tipo
  obtenerPorTipo: async (tipo) => {
    const query = 'SELECT * FROM proveedor WHERE pr_tipo = ? AND pr_activo = TRUE ORDER BY pr_nombres, pr_apellidos';
    const [resultados] = await pool.query(query, [tipo]);
    return resultados;
  },

  // Obtener estadísticas de proveedores
  obtenerEstadisticas: async () => {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(pr_activo = 1) as activos,
        COUNT(DISTINCT pr_tipo) as tipos,
        SUM(pr_tipo = 1) as normales,
        SUM(pr_tipo = 2) as mayoristas
      FROM proveedor
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloProveedor;