import { pool } from "../config/BaseDatos.js";
import crypto from "crypto";

const ModeloUsuario = {
  // Función para encriptar contraseña
  generarMD5: (texto) => {
    return crypto.createHash("md5").update(texto).digest("hex");
  },

  // Crear un nuevo usuario con contraseña encriptada
  crear: async (nuevoUsuario) => {
    // Encriptar contraseña
    const contrasenaMD5 = ModeloUsuario.generarMD5(nuevoUsuario.contrasena);

    const query = `
      INSERT INTO usuario 
      (u_nombres, u_apellidos, u_identificacion, u_email, u_ciudad, u_direccion, u_celular, u_tipo, u_contrasena) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultados] = await pool.query(query, [
      nuevoUsuario.nombres,
      nuevoUsuario.apellidos,
      nuevoUsuario.identificacion,
      nuevoUsuario.email,
      nuevoUsuario.ciudad,
      nuevoUsuario.direccion,
      nuevoUsuario.celular,
      nuevoUsuario.tipo,
      contrasenaMD5, // Usar la contraseña encriptada
    ]);
    return resultados;
  },

  // Obtener todos los usuarios (sin contraseñas)
  obtenerTodos: async () => {
    const query = `
      SELECT u_id, u_nombres, u_apellidos, u_identificacion, u_email, 
             u_ciudad, u_direccion, u_celular, u_tipo, u_activo, u_fecha_creacion
      FROM usuario 
      ORDER BY u_nombres, u_apellidos
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener usuario por ID
  obtenerPorId: async (id) => {
    const query = `
      SELECT u_id, u_nombres, u_apellidos, u_identificacion, u_email, 
             u_ciudad, u_direccion, u_celular, u_tipo, u_activo, u_fecha_creacion
      FROM usuario 
      WHERE u_id = ?
    `;
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener usuario por email
  obtenerPorEmail: async (email) => {
    const query = "SELECT * FROM usuario WHERE u_email = ? AND u_activo = 1";
    const [resultados] = await pool.query(query, [email]);
    return resultados;
  },

  // Actualizar usuario
  actualizar: async (id, usuario) => {
    let query, params;

    if (usuario.contrasena) {
      // Encriptar nueva contraseña
      const contrasenaMD5 = ModeloUsuario.generarMD5(nuevoUsuario.contrasena);

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
        id,
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
        id,
      ];
    }

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Eliminar usuario (desactivar)
  eliminar: async (id) => {
    const query = "UPDATE usuario SET u_activo = FALSE WHERE u_id = ?";
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Reactivar usuario
  reactivar: async (id) => {
    const query = "UPDATE usuario SET u_activo = TRUE WHERE u_id = ?";
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si email existe
  verificarEmailExistente: async (email, excludeId = null) => {
    let query = "SELECT COUNT(*) as count FROM usuario WHERE u_email = ?";
    let params = [email];

    if (excludeId) {
      query += " AND u_id != ?";
      params.push(excludeId);
    }

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Verificar si identificación existe
  verificarIdentificacionExistente: async (
    identificacion,
    excludeId = null
  ) => {
    let query =
      "SELECT COUNT(*) as count FROM usuario WHERE u_identificacion = ?";
    let params = [identificacion];

    if (excludeId) {
      query += " AND u_id != ?";
      params.push(excludeId);
    }

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Obtener estadísticas de usuarios
  obtenerEstadisticas: async () => {
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
    const [resultados] = await pool.query(query);
    return resultados;
  },
};

export default ModeloUsuario;
