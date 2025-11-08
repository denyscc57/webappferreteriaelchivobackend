const db = require('../config/BaseDatos');
const crypto = require('crypto');

const ModeloUsuario = {
  // Función para generar MD5
  generarMD5: (texto) => {
    return crypto.createHash('md5').update(texto).digest('hex');
  },

  // Crear un nuevo usuario
  crear: (nuevoUsuario, callback) => {
    const query = `
      INSERT INTO usuario 
      (u_nombres, u_apellidos, u_identificacion, u_email, u_ciudad, u_direccion, u_celular, u_tipo, u_contrasena) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Aplicar MD5 a la contraseña
    const contrasenaMD5 = ModeloUsuario.generarMD5(nuevoUsuario.contrasena);
    
    db.query(query, [
      nuevoUsuario.nombres,
      nuevoUsuario.apellidos,
      nuevoUsuario.identificacion,
      nuevoUsuario.email,
      nuevoUsuario.ciudad,
      nuevoUsuario.direccion,
      nuevoUsuario.celular,
      nuevoUsuario.tipo,
      contrasenaMD5
    ], callback);
  },

  // Obtener todos los usuarios (sin contraseñas)
  obtenerTodos: (callback) => {
    const query = `
      SELECT u_id, u_nombres, u_apellidos, u_identificacion, u_email, 
             u_ciudad, u_direccion, u_celular, u_tipo, u_activo, u_fecha_creacion
      FROM usuario 
      ORDER BY u_nombres, u_apellidos
    `;
    db.query(query, callback);
  },

  // Obtener usuario por ID
  obtenerPorId: (id, callback) => {
    const query = `
      SELECT u_id, u_nombres, u_apellidos, u_identificacion, u_email, 
             u_ciudad, u_direccion, u_celular, u_tipo, u_activo, u_fecha_creacion
      FROM usuario 
      WHERE u_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Obtener usuario por email (para login)
  obtenerPorEmail: (email, callback) => {
    const query = 'SELECT * FROM usuario WHERE u_email = ? AND u_activo = TRUE';
    db.query(query, [email], callback);
  },

  // Actualizar usuario
  actualizar: (id, usuario, callback) => {
    let query, params;
    
    if (usuario.contrasena) {
      // Aplicar MD5 a la nueva contraseña
      const contrasenaMD5 = ModeloUsuario.generarMD5(usuario.contrasena);
      
      query = `
        UPDATE usuario 
        SET u_nombres=?, u_apellidos=?, u_identificacion=?, u_email=?, 
            u_ciudad=?, u_direccion=?, u_celular=?, u_tipo=?, u_contrasena=?
        WHERE u_id=?
      `;
      params = [
        usuario.nombres,
        usuario.apellidos,
        usuario.identificacion,
        usuario.email,
        usuario.ciudad,
        usuario.direccion,
        usuario.celular,
        usuario.tipo,
        contrasenaMD5,
        id
      ];
    } else {
      query = `
        UPDATE usuario 
        SET u_nombres=?, u_apellidos=?, u_identificacion=?, u_email=?, 
            u_ciudad=?, u_direccion=?, u_celular=?, u_tipo=?
        WHERE u_id=?
      `;
      params = [
        usuario.nombres,
        usuario.apellidos,
        usuario.identificacion,
        usuario.email,
        usuario.ciudad,
        usuario.direccion,
        usuario.celular,
        usuario.tipo,
        id
      ];
    }
    
    db.query(query, params, callback);
  },

  // Cambiar solo la contraseña
  cambiarContrasena: (id, nuevaContrasena, callback) => {
    const contrasenaMD5 = ModeloUsuario.generarMD5(nuevaContrasena);
    const query = 'UPDATE usuario SET u_contrasena = ? WHERE u_id = ?';
    db.query(query, [contrasenaMD5, id], callback);
  },

  // Eliminar usuario (desactivar)
  eliminar: (id, callback) => {
    const query = 'UPDATE usuario SET u_activo = FALSE WHERE u_id = ?';
    db.query(query, [id], callback);
  },

  // Reactivar usuario
  reactivar: (id, callback) => {
    const query = 'UPDATE usuario SET u_activo = TRUE WHERE u_id = ?';
    db.query(query, [id], callback);
  },

  // Verificar si email existe
  verificarEmailExistente: (email, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM usuario WHERE u_email = ?';
    let params = [email];
    
    if (excludeId) {
      query += ' AND u_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Verificar si identificación existe
  verificarIdentificacionExistente: (identificacion, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM usuario WHERE u_identificacion = ?';
    let params = [identificacion];
    
    if (excludeId) {
      query += ' AND u_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Obtener estadísticas de usuarios
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(u_activo = 1) as activos,
        SUM(u_activo = 0) as inactivos,
        SUM(u_tipo = 1) as administradores,
        SUM(u_tipo = 2) as bodegas,
        SUM(u_tipo = 3) as vendedores
      FROM usuario
    `;
    db.query(query, callback);
  }
};

module.exports = ModeloUsuario;