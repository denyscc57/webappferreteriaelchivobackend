const db = require('../config/BaseDatos');

const ModeloCliente = {
  // Crear un nuevo cliente
  crear: (nuevoCliente, callback) => {
    const query = `
      INSERT INTO cliente 
      (c_nombres, c_apellidos, c_identificacion, c_email, c_ciudad, c_direccion, c_celular, c_tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      nuevoCliente.nombres,
      nuevoCliente.apellidos,
      nuevoCliente.identificacion,
      nuevoCliente.email,
      nuevoCliente.ciudad,
      nuevoCliente.direccion,
      nuevoCliente.celular,
      nuevoCliente.tipo || 1
    ], callback);
  },

  // Obtener todos los clientes activos
  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM cliente WHERE c_activo = TRUE ORDER BY c_nombres, c_apellidos';
    db.query(query, callback);
  },

  // Obtener cliente por ID
  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM cliente WHERE c_id = ? AND c_activo = TRUE';
    db.query(query, [id], callback);
  },

  // Obtener cliente por identificación
  obtenerPorIdentificacion: (identificacion, callback) => {
    const query = 'SELECT * FROM cliente WHERE c_identificacion = ? AND c_activo = TRUE';
    db.query(query, [identificacion], callback);
  },

  // Actualizar cliente
  actualizar: (id, cliente, callback) => {
    const query = `
      UPDATE cliente 
      SET c_nombres=?, c_apellidos=?, c_identificacion=?, c_email=?, 
          c_ciudad=?, c_direccion=?, c_celular=?, c_tipo=?
      WHERE c_id=? AND c_activo = TRUE
    `;
    
    db.query(query, [
      cliente.nombres,
      cliente.apellidos,
      cliente.identificacion,
      cliente.email,
      cliente.ciudad,
      cliente.direccion,
      cliente.celular,
      cliente.tipo,
      id
    ], callback);
  },

  // Eliminar cliente (desactivar)
  eliminar: (id, callback) => {
    const query = 'UPDATE cliente SET c_activo = FALSE WHERE c_id = ?';
    db.query(query, [id], callback);
  },

  // Reactivar cliente
  reactivar: (id, callback) => {
    const query = 'UPDATE cliente SET c_activo = TRUE WHERE c_id = ?';
    db.query(query, [id], callback);
  },

  // Verificar si identificación ya existe
  verificarIdentificacionExistente: (identificacion, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM cliente WHERE c_identificacion = ? AND c_activo = TRUE';
    let params = [identificacion];
    
    if (excludeId) {
      query += ' AND c_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Buscar clientes por nombre, apellido o identificación
  buscar: (termino, callback) => {
    const query = `
      SELECT * FROM cliente 
      WHERE (c_nombres LIKE ? OR c_apellidos LIKE ? OR c_identificacion LIKE ?) 
      AND c_activo = TRUE 
      ORDER BY c_nombres, c_apellidos
    `;
    const terminoBusqueda = `%${termino}%`;
    db.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda], callback);
  },

  // Obtener clientes por tipo
  obtenerPorTipo: (tipo, callback) => {
    const query = 'SELECT * FROM cliente WHERE c_tipo = ? AND c_activo = TRUE ORDER BY c_nombres, c_apellidos';
    db.query(query, [tipo], callback);
  },

  // Obtener estadísticas de clientes
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(c_activo = 1) as activos,
        COUNT(DISTINCT c_tipo) as tipos,
        SUM(c_tipo = 1) as normales,
        SUM(c_tipo = 2) as mayoristas
      FROM cliente
    `;
    db.query(query, callback);
  },

  // ModeloCliente.js - Agregar este método
obtenerPorIdentificacion: (identificacion, callback) => {
  const query = 'SELECT * FROM cliente WHERE c_identificacion = ?';
  db.query(query, [identificacion], callback);
}
};

module.exports = ModeloCliente;