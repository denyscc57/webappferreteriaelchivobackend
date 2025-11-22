import { pool } from '../config/BaseDatos.js';

const ModeloCliente = {
  // Crear un nuevo cliente
  crear: async (nuevoCliente) => {
    const query = `
      INSERT INTO cliente 
      (c_nombres, c_apellidos, c_identificacion, c_email, c_ciudad, c_direccion, c_celular, c_tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      nuevoCliente.nombres,
      nuevoCliente.apellidos,
      nuevoCliente.identificacion,
      nuevoCliente.email,
      nuevoCliente.ciudad,
      nuevoCliente.direccion,
      nuevoCliente.celular,
      nuevoCliente.tipo || 1
    ]);
    return resultados;
  },

  // Obtener todos los clientes activos
  obtenerTodos: async () => {
    const query = 'SELECT * FROM cliente WHERE c_activo = TRUE ORDER BY c_nombres, c_apellidos';
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener cliente por ID
  obtenerPorId: async (id) => {
    const query = 'SELECT * FROM cliente WHERE c_id = ? AND c_activo = TRUE';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener cliente por identificación
  obtenerPorIdentificacion: async (identificacion) => {
    const query = 'SELECT * FROM cliente WHERE c_identificacion = ? AND c_activo = TRUE';
    const [resultados] = await pool.query(query, [identificacion]);
    return resultados;
  },

  // Actualizar cliente
  actualizar: async (id, cliente) => {
    const query = `
      UPDATE cliente 
      SET c_nombres=?, c_apellidos=?, c_identificacion=?, c_email=?, 
          c_ciudad=?, c_direccion=?, c_celular=?, c_tipo=?
      WHERE c_id=? AND c_activo = TRUE
    `;
    
    const [resultados] = await pool.query(query, [
      cliente.nombres,
      cliente.apellidos,
      cliente.identificacion,
      cliente.email,
      cliente.ciudad,
      cliente.direccion,
      cliente.celular,
      cliente.tipo,
      id
    ]);
    return resultados;
  },

  // Eliminar cliente (desactivar)
  eliminar: async (id) => {
    const query = 'UPDATE cliente SET c_activo = FALSE WHERE c_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Reactivar cliente
  reactivar: async (id) => {
    const query = 'UPDATE cliente SET c_activo = TRUE WHERE c_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si identificación ya existe
  verificarIdentificacionExistente: async (identificacion, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM cliente WHERE c_identificacion = ? AND c_activo = TRUE';
    let params = [identificacion];
    
    if (excludeId) {
      query += ' AND c_id != ?';
      params.push(excludeId);
    }
    
    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Buscar clientes por nombre, apellido o identificación
  buscar: async (termino) => {
    const query = `
      SELECT * FROM cliente 
      WHERE (c_nombres LIKE ? OR c_apellidos LIKE ? OR c_identificacion LIKE ?) 
      AND c_activo = TRUE 
      ORDER BY c_nombres, c_apellidos
    `;
    const terminoBusqueda = `%${termino}%`;
    const [resultados] = await pool.query(query, [terminoBusqueda, terminoBusqueda, terminoBusqueda]);
    return resultados;
  },

  // Obtener clientes por tipo
  obtenerPorTipo: async (tipo) => {
    const query = 'SELECT * FROM cliente WHERE c_tipo = ? AND c_activo = TRUE ORDER BY c_nombres, c_apellidos';
    const [resultados] = await pool.query(query, [tipo]);
    return resultados;
  },

  // Obtener estadísticas de clientes
  obtenerEstadisticas: async () => {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(c_activo = 1) as activos,
        COUNT(DISTINCT c_tipo) as tipos,
        SUM(c_tipo = 1) as normales,
        SUM(c_tipo = 2) as mayoristas
      FROM cliente
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloCliente;