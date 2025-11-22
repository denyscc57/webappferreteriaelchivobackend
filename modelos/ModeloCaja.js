import { pool } from '../config/BaseDatos.js';

const ModeloCaja = {
  // Abrir una nueva caja
  abrirCaja: async (caja) => {
    const query = `
      INSERT INTO caja 
      (ca_fecha_apertura, ca_monto_inicial, ca_estado, ca_usuarioFK) 
      VALUES (?, ?, 'abierta', ?)
    `;
    
    const [resultados] = await pool.query(query, [
      caja.fecha_apertura,
      caja.monto_inicial,
      caja.id_usuario
    ]);
    return resultados;
  },

  // Cerrar caja
  cerrarCaja: async (id_caja, datosCierre) => {
    const query = `
      UPDATE caja 
      SET ca_fecha_cierre = ?, ca_monto_final = ?, ca_estado = 'cerrada'
      WHERE ca_id = ?
    `;
    
    const [resultados] = await pool.query(query, [
      datosCierre.fecha_cierre,
      datosCierre.monto_final,
      id_caja
    ]);
    return resultados;
  },

  // Obtener caja por ID
  obtenerCajaPorId: async (id) => {
    const query = `
      SELECT c.*, u.u_nombres, u.u_apellidos
      FROM caja c
      INNER JOIN usuario u ON c.ca_usuarioFK = u.u_id
      WHERE c.ca_id = ?
    `;
    
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener caja abierta por usuario
  obtenerCajaAbiertaPorUsuario: async (id_usuario) => {
    const query = `
      SELECT c.*, u.u_nombres, u.u_apellidos
      FROM caja c
      INNER JOIN usuario u ON c.ca_usuarioFK = u.u_id
      WHERE c.ca_usuarioFK = ? AND c.ca_estado = 'abierta'
      ORDER BY c.ca_fecha_apertura DESC
      LIMIT 1
    `;
    
    const [resultados] = await pool.query(query, [id_usuario]);
    return resultados;
  },

  // Obtener todas las cajas con filtros
  obtenerCajas: async (filtros = {}) => {
    let query = `
      SELECT c.*, u.u_nombres, u.u_apellidos
      FROM caja c
      INNER JOIN usuario u ON c.ca_usuarioFK = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (filtros.estado) {
      query += ' AND c.ca_estado = ?';
      params.push(filtros.estado);
    }

    if (filtros.usuario) {
      query += ' AND c.ca_usuarioFK = ?';
      params.push(filtros.usuario);
    }

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ' AND DATE(c.ca_fecha_apertura) BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    query += ' ORDER BY c.ca_fecha_apertura DESC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Obtener total de ventas por caja
  obtenerTotalVentasPorCaja: async (id_caja) => {
    const query = `
      SELECT COALESCE(SUM(v_total), 0) as total_ventas
      FROM venta 
      WHERE v_cajaFK = ?
    `;
    
    const [resultados] = await pool.query(query, [id_caja]);
    return resultados;
  },

  // Obtener estadísticas de caja
  obtenerEstadisticasCaja: async () => {
    const query = `
      SELECT 
        COUNT(*) as total_cajas,
        SUM(CASE WHEN ca_estado = 'abierta' THEN 1 ELSE 0 END) as cajas_abiertas,
        SUM(CASE WHEN ca_estado = 'cerrada' THEN 1 ELSE 0 END) as cajas_cerradas,
        COALESCE(SUM(ca_monto_inicial), 0) as total_monto_inicial,
        COALESCE(SUM(ca_monto_final), 0) as total_monto_final,
        MIN(ca_fecha_apertura) as primera_apertura,
        MAX(ca_fecha_apertura) as ultima_apertura
      FROM caja
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener última caja abierta
  obtenerUltimaCajaAbierta: async () => {
    const query = `
      SELECT c.*, u.u_nombres, u.u_apellidos
      FROM caja c
      INNER JOIN usuario u ON c.ca_usuarioFK = u.u_id
      WHERE c.ca_estado = 'abierta'
      ORDER BY c.ca_fecha_apertura DESC
      LIMIT 1
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloCaja;