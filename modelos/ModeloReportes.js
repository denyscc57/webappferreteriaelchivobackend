import { pool } from '../config/BaseDatos.js';

const ModeloReportes = {
  // Productos por lote
  obtenerProductosPorLote: async (idLote) => {
    let query = `
      SELECT p.*, l.l_nombre as lote_nombre, pr.pr_nombres as proveedor_nombre,
             um.m_unidad as unidad_medida
      FROM producto p
      INNER JOIN lote l ON p.p_loteFK = l.l_id
      INNER JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      INNER JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      WHERE 1=1
    `;
    let params = [];

    if (idLote) {
      query += ' AND p.p_loteFK = ?';
      params.push(idLote);
    }

    query += ' ORDER BY p.p_nombre ASC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Productos por lote y fecha
  obtenerProductosPorLoteYFecha: async (idLote, fechaInicio, fechaFin) => {
    let query = `
      SELECT p.*, l.l_nombre as lote_nombre, pr.pr_nombres as proveedor_nombre,
             um.m_unidad as unidad_medida
      FROM producto p
      INNER JOIN lote l ON p.p_loteFK = l.l_id
      INNER JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      INNER JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      WHERE 1=1
    `;
    let params = [];

    if (idLote) {
      query += ' AND p.p_loteFK = ?';
      params.push(idLote);
    }

    if (fechaInicio && fechaFin) {
      query += ' AND p.p_fecha_vencimiento BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY p.p_nombre ASC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Ventas por rango de fechas
  obtenerVentasPorFecha: async (fechaInicio, fechaFin) => {
    let query = `
      SELECT v.*, c.c_nombres as cliente_nombres, c.c_apellidos as cliente_apellidos,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      INNER JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (fechaInicio && fechaFin) {
      query += ' AND v.v_fecha BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY v.v_fecha DESC, v.v_hora DESC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Ventas generales
  obtenerVentasGenerales: async () => {
    const query = `
      SELECT v.*, c.c_nombres as cliente_nombres, c.c_apellidos as cliente_apellidos,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      INNER JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      ORDER BY v.v_fecha DESC, v.v_hora DESC
    `;

    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Buscar venta por factura
  obtenerVentaPorFactura: async (factura) => {
    const query = `
      SELECT v.*, c.c_nombres as cliente_nombres, c.c_apellidos as cliente_apellidos,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      INNER JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE v.v_factura = ?
    `;

    const [resultados] = await pool.query(query, [factura]);
    return resultados;
  },

  // Movimientos de inventario por tipo y fechas
  obtenerMovimientosInventario: async (tipo, fechaInicio, fechaFin) => {
    let query = `
      SELECT i.*, p.p_nombre as producto_nombre, p.p_codigo as producto_codigo,
             u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN producto p ON i.i_idproductofk = p.p_id
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (tipo && tipo !== 'todos') {
      query += ' AND i.i_tipo_movimiento = ?';
      params.push(tipo);
    }

    if (fechaInicio && fechaFin) {
      query += ' AND i.i_fecha BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY i.i_fecha DESC, i.i_hora DESC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Productos por fecha de vencimiento
  obtenerProductosPorVencimiento: async (fechaInicio, fechaFin) => {
    let query = `
      SELECT p.*, l.l_nombre as lote_nombre, pr.pr_nombres as proveedor_nombre,
             um.m_unidad as unidad_medida,
             DATEDIFF(p.p_fecha_vencimiento, CURDATE()) as dias_para_vencer
      FROM producto p
      INNER JOIN lote l ON p.p_loteFK = l.l_id
      INNER JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      INNER JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      WHERE p.p_fecha_vencimiento IS NOT NULL
    `;
    let params = [];

    if (fechaInicio && fechaFin) {
      query += ' AND p.p_fecha_vencimiento BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY p.p_fecha_vencimiento ASC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  }
};

export default ModeloReportes;