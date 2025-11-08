const db = require('../config/BaseDatos');

const ModeloVenta = {
  // Crear una nueva venta (adaptado a tu estructura de BD)
  crear: (nuevaVenta, callback) => {
    const query = `
      INSERT INTO venta 
      (v_factura, v_fkidcliente, v_fkidusuario, v_identificacion, v_nombresapellidos, 
       v_ciudad, v_direccion, v_celular, v_fecha, v_hora, v_cajaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      nuevaVenta.factura,
      nuevaVenta.id_cliente,
      nuevaVenta.id_usuario,
      nuevaVenta.identificacion,
      nuevaVenta.nombresapellidos,
      nuevaVenta.ciudad,
      nuevaVenta.direccion,
      nuevaVenta.celular,
      nuevaVenta.fecha,
      nuevaVenta.hora,
      nuevaVenta.id_caja // Añadir el campo de caja
    ], callback);
  },

  // Agregar detalle de venta (actualizado con campo de caja)
  agregarDetalleVenta: (detalle, callback) => {
    const query = `
      INSERT INTO venta 
      (v_factura, v_nombre, v_marca, v_precio, v_cantidad, v_total, 
       v_fkidcliente, v_fkidusuario, v_identificacion, v_nombresapellidos, 
       v_ciudad, v_direccion, v_celular, v_fecha, v_hora, v_cajaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      detalle.factura,
      detalle.nombre,
      detalle.marca,
      detalle.precio,
      detalle.cantidad,
      detalle.total,
      detalle.id_cliente,
      detalle.id_usuario,
      detalle.identificacion,
      detalle.nombresapellidos,
      detalle.ciudad,
      detalle.direccion,
      detalle.celular,
      detalle.fecha,
      detalle.hora,
      detalle.id_caja // Añadir el campo de caja
    ], callback);
  },

  // Agregar registro de inventario (CORREGIDO)
  agregarInventario: (inventario, callback) => {
    const query = `
      INSERT INTO inventario 
      (i_idproductofk, i_tipo_movimiento, i_cantidad, i_idusuariofk, i_motivo, i_fecha, i_hora) 
      VALUES (?, 'salida', ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      inventario.id_producto,
      inventario.cantidad,
      inventario.id_usuario,
      'Venta', // Motivo fijo como "Venta"
      inventario.fecha,
      inventario.hora
    ], callback);
  },

  // Obtener venta por ID
  obtenerPorId: (id, callback) => {
    const query = `
      SELECT v.*, c.c_nombres, c.c_apellidos, c.c_identificacion, c.c_email, c.c_direccion,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      LEFT JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE v.v_id = ?
    `;
    
    db.query(query, [id], callback);
  },

  // Obtener todas las ventas
  obtenerTodas: (filtros = {}, callback) => {
    let query = `
      SELECT v.*, c.c_nombres, c.c_apellidos, u.u_nombres as vendedor_nombres
      FROM venta v
      LEFT JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ' AND v.v_fecha BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    if (filtros.vendedor) {
      query += ' AND v.v_fkidusuario = ?';
      params.push(filtros.vendedor);
    }

    query += ' ORDER BY v.v_fecha DESC, v.v_hora DESC';

    db.query(query, params, callback);
  },

  // Generar número de factura único
  generarNumeroFactura: (callback) => {
    const prefix = 'F';
    const year = new Date().getFullYear();
    const query = 'SELECT COUNT(*) as total FROM venta WHERE v_factura LIKE ?';
    const likePattern = `${prefix}${year}%`;
    
    db.query(query, [likePattern], (err, resultados) => {
      if (err) return callback(err);
      
      const nextNumber = resultados[0].total + 1;
      const factura = `${prefix}${year}${nextNumber.toString().padStart(8, '0')}`;
      callback(null, factura);
    });
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        SUM(v_total) as total_ingresos,
        AVG(v_total) as promedio_venta,
        MIN(v_fecha) as fecha_primer_venta,
        MAX(v_fecha) as fecha_ultima_venta,
        COUNT(DISTINCT v_fkidcliente) as clientes_unicos
      FROM venta
    `;
    
    db.query(query, callback);
  }
};

module.exports = ModeloVenta;