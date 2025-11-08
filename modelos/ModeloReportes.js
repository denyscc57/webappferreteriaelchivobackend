const db = require('../config/BaseDatos');

const ModeloReportes = {
  // Productos por lote
obtenerProductosPorLote: (idLote, callback) => {
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

    db.query(query, params, callback);
  },


 obtenerProductosPorLoteYFecha: (idLote, fechaInicio, fechaFin, callback) => {
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
      // USAR p_fecha_vencimiento EN LUGAR DE p_fecha_creacion
      query += ' AND p.p_fecha_vencimiento BETWEEN ? AND ?';
      params.push(fechaInicio, fechaFin);
    }

    query += ' ORDER BY p.p_nombre ASC';

    db.query(query, params, callback);
  },


  // Ventas por rango de fechas
  obtenerVentasPorFecha: (fechaInicio, fechaFin, callback) => {
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

    db.query(query, params, callback);
  },

  // Ventas generales
  obtenerVentasGenerales: (callback) => {
    const query = `
      SELECT v.*, c.c_nombres as cliente_nombres, c.c_apellidos as cliente_apellidos,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      INNER JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      ORDER BY v.v_fecha DESC, v.v_hora DESC
    `;

    db.query(query, callback);
  },

  // Buscar venta por factura
  obtenerVentaPorFactura: (factura, callback) => {
    const query = `
      SELECT v.*, c.c_nombres as cliente_nombres, c.c_apellidos as cliente_apellidos,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      INNER JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE v.v_factura = ?
    `;

    db.query(query, [factura], callback);
  },

  // Movimientos de inventario por tipo y fechas
  obtenerMovimientosInventario: (tipo, fechaInicio, fechaFin, callback) => {
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

    db.query(query, params, callback);
  },

  // Productos por fecha de vencimiento
  obtenerProductosPorVencimiento: (fechaInicio, fechaFin, callback) => {
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

    db.query(query, params, callback);
  }
};

module.exports = ModeloReportes;