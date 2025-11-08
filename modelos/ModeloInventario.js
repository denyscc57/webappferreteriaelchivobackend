const db = require('../config/BaseDatos');

const ModeloInventario = {
  // Registrar movimiento de inventario
  registrarMovimiento: (movimiento, callback) => {
    const query = `
      INSERT INTO inventario 
      (i_idproductofk, i_tipo_movimiento, i_cantidad, i_motivo, i_idusuariofk, i_fecha, i_hora) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      movimiento.id_producto,
      movimiento.tipo_movimiento,
      movimiento.cantidad,
      movimiento.motivo,
      movimiento.id_usuario,
      movimiento.fecha,
      movimiento.hora
    ], callback);
  },

  // Obtener todos los movimientos de inventario
  obtenerMovimientos: (filtros = {}, callback) => {
    let query = `
      SELECT i.*, p.p_nombre as producto_nombre, p.p_codigo as producto_codigo,
             u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN producto p ON i.i_idproductofk = p.p_id
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (filtros.producto) {
      query += ' AND i.i_idproductofk = ?';
      params.push(filtros.producto);
    }

    if (filtros.tipo) {
      query += ' AND i.i_tipo_movimiento = ?';
      params.push(filtros.tipo);
    }

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ' AND i.i_fecha BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    query += ' ORDER BY i.i_fecha DESC, i.i_hora DESC';

    db.query(query, params, callback);
  },

  // Obtener movimiento por ID
  obtenerMovimientoPorId: (id, callback) => {
    const query = `
      SELECT i.*, p.p_nombre as producto_nombre, p.p_codigo as producto_codigo,
             u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN producto p ON i.i_idproductofk = p.p_id
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE i.i_id = ?
    `;
    
    db.query(query, [id], callback);
  },

  // Obtener historial de un producto específico
  obtenerHistorialProducto: (idProducto, callback) => {
    const query = `
      SELECT i.*, u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE i.i_idproductofk = ?
      ORDER BY i.i_fecha DESC, i.i_hora DESC
    `;
    
    db.query(query, [idProducto], callback);
  },

  // Obtener kardex de producto (saldo actual)
  obtenerKardexProducto: (idProducto, callback) => {
    const query = `
      SELECT 
        p.p_id,
        p.p_codigo,
        p.p_nombre,
        p.p_stock as stock_actual,
        p.p_stock_minimo,
        COALESCE(SUM(CASE WHEN i.i_tipo_movimiento = 'entrada' THEN i.i_cantidad ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN i.i_tipo_movimiento = 'salida' THEN i.i_cantidad ELSE 0 END), 0) as total_salidas,
        p.p_fecha_vencimiento
      FROM producto p
      LEFT JOIN inventario i ON p.p_id = i.i_idproductofk
      WHERE p.p_id = ?
      GROUP BY p.p_id
    `;
    
    db.query(query, [idProducto], callback);
  },

  // Obtener productos con stock bajo
  obtenerProductosStockBajo: (callback) => {
    const query = `
      SELECT p.*, 
             DATEDIFF(p.p_fecha_vencimiento, CURDATE()) as dias_para_vencer
      FROM producto p 
      WHERE p.p_activo = TRUE 
      AND (p.p_stock <= p.p_stock_minimo OR p.p_fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
      ORDER BY p.p_stock ASC, p.p_fecha_vencimiento ASC
    `;
    
    db.query(query, callback);
  },

  // Obtener productos próximos a vencer (30 días)
  obtenerProductosProximosVencer: (callback) => {
    const query = `
      SELECT p.*, 
             DATEDIFF(p.p_fecha_vencimiento, CURDATE()) as dias_para_vencer
      FROM producto p 
      WHERE p.p_activo = TRUE 
      AND p.p_fecha_vencimiento IS NOT NULL
      AND p.p_fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND p.p_fecha_vencimiento >= CURDATE()
      ORDER BY p.p_fecha_vencimiento ASC
    `;
    
    db.query(query, callback);
  },

  // Obtener estadísticas de inventario
  obtenerEstadisticas: (callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_movimientos,
        SUM(CASE WHEN i.i_tipo_movimiento = 'entrada' THEN 1 ELSE 0 END) as total_entradas,
        SUM(CASE WHEN i.i_tipo_movimiento = 'salida' THEN 1 ELSE 0 END) as total_salidas,
        COUNT(DISTINCT i.i_idproductofk) as productos_con_movimiento,
        MIN(i.i_fecha) as fecha_primer_movimiento,
        MAX(i.i_fecha) as fecha_ultimo_movimiento
      FROM inventario i
    `;
    
    db.query(query, callback);
  }
};

module.exports = ModeloInventario;