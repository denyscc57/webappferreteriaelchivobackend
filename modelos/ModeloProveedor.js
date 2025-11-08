const db = require('../config/BaseDatos');

const ModeloProveedor = {
  // Crear un nuevo proveedor
  crear: (nuevoProveedor, callback) => {
    const query = `
      INSERT INTO proveedor 
      (pr_nombres, pr_apellidos, pr_identificacion, pr_email, pr_ciudad, pr_direccion, pr_celular, pr_tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      nuevoProveedor.nombres,
      nuevoProveedor.apellidos,
      nuevoProveedor.identificacion,
      nuevoProveedor.email,
      nuevoProveedor.ciudad,
      nuevoProveedor.direccion,
      nuevoProveedor.celular,
      nuevoProveedor.tipo || 1
    ], callback);
  },

  // Obtener todos los proveedores activos
  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM proveedor WHERE pr_activo = TRUE ORDER BY pr_nombres, pr_apellidos';
    db.query(query, callback);
  },

  // Obtener proveedor por ID
  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM proveedor WHERE pr_id = ? AND pr_activo = TRUE';
    db.query(query, [id], callback);
  },

  // Obtener proveedor por identificación
  obtenerPorIdentificacion: (identificacion, callback) => {
    const query = 'SELECT * FROM proveedor WHERE pr_identificacion = ? AND pr_activo = TRUE';
    db.query(query, [identificacion], callback);
  },

  // Actualizar proveedor
  actualizar: (id, proveedor, callback) => {
    const query = `
      UPDATE proveedor 
      SET pr_nombres=?, pr_apellidos=?, pr_identificacion=?, pr_email=?, 
          pr_ciudad=?, pr_direccion=?, pr_celular=?, pr_tipo=?
      WHERE pr_id=? AND pr_activo = TRUE
    `;
    
    db.query(query, [
      proveedor.nombres,
      proveedor.apellidos,
      proveedor.identificacion,
      proveedor.email,
      proveedor.ciudad,
      proveedor.direccion,
      proveedor.celular,
      proveedor.tipo,
      id
    ], callback);
  },

  // Eliminar proveedor (desactivar)
  eliminar: (id, callback) => {
    const query = 'UPDATE proveedor SET pr_activo = FALSE WHERE pr_id = ?';
    db.query(query, [id], callback);
  },

  // Reactivar proveedor
  reactivar: (id, callback) => {
    const query = 'UPDATE proveedor SET pr_activo = TRUE WHERE pr_id = ?';
    db.query(query, [id], callback);
  },

  // Verificar si identificación ya existe
  verificarIdentificacionExistente: (identificacion, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM proveedor WHERE pr_identificacion = ? AND pr_activo = TRUE';
    let params = [identificacion];
    
    if (excludeId) {
      query += ' AND pr_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Buscar proveedores por nombre, apellido o identificación
  buscar: (termino, callback) => {
    const query = `
      SELECT * FROM proveedor 
      WHERE (pr_nombres LIKE ? OR pr_apellidos LIKE ? OR pr_identificacion LIKE ?) 
      AND pr_activo = TRUE 
      ORDER BY pr_nombres, pr_apellidos
    `;
    const terminoBusqueda = `%${termino}%`;
    db.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda], callback);
  },

  // Obtener proveedores por tipo
  obtenerPorTipo: (tipo, callback) => {
    const query = 'SELECT * FROM proveedor WHERE pr_tipo = ? AND pr_activo = TRUE ORDER BY pr_nombres, pr_apellidos';
    db.query(query, [tipo], callback);
  },

  // Obtener estadísticas de proveedores
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(pr_activo = 1) as activos,
        COUNT(DISTINCT pr_tipo) as tipos,
        SUM(pr_tipo = 1) as normales,
        SUM(pr_tipo = 2) as mayoristas
      FROM proveedor
    `;
    db.query(query, callback);
  }
};

module.exports = ModeloProveedor;