import { pool } from '../config/BaseDatos.js';
import ModeloProducto from './ModeloProducto.js';

const ModeloInventario = {
  // Registrar movimiento de inventario
  registrarMovimiento: async (movimiento) => {
    const query = `
      INSERT INTO inventario 
      (i_idproductofk, i_tipo_movimiento, i_cantidad, i_motivo, i_idusuariofk, i_fecha, i_hora) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      movimiento.id_producto,
      movimiento.tipo_movimiento,
      movimiento.cantidad,
      movimiento.motivo,
      movimiento.id_usuario,
      movimiento.fecha,
      movimiento.hora
    ]);
    return resultados;
  },

  // Obtener todos los movimientos de inventario
  obtenerMovimientos: async (filtros = {}) => {
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

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Obtener movimiento por ID
  obtenerMovimientoPorId: async (id) => {
    const query = `
      SELECT i.*, p.p_nombre as producto_nombre, p.p_codigo as producto_codigo,
             u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN producto p ON i.i_idproductofk = p.p_id
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE i.i_id = ?
    `;
    
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener historial de un producto específico
  obtenerHistorialProducto: async (idProducto) => {
    const query = `
      SELECT i.*, u.u_nombres as usuario_nombre, u.u_apellidos as usuario_apellidos
      FROM inventario i
      INNER JOIN usuario u ON i.i_idusuariofk = u.u_id
      WHERE i.i_idproductofk = ?
      ORDER BY i.i_fecha DESC, i.i_hora DESC
    `;
    
    const [resultados] = await pool.query(query, [idProducto]);
    return resultados;
  },

  // Obtener kardex de producto (saldo actual)
  obtenerKardexProducto: async (idProducto) => {
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
    
    const [resultados] = await pool.query(query, [idProducto]);
    return resultados;
  },

  // Obtener productos con stock bajo
  obtenerProductosStockBajo: async () => {
    const query = `
      SELECT p.*, 
             DATEDIFF(p.p_fecha_vencimiento, CURDATE()) as dias_para_vencer
      FROM producto p 
      WHERE p.p_activo = TRUE 
      AND (p.p_stock <= p.p_stock_minimo OR p.p_fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
      ORDER BY p.p_stock ASC, p.p_fecha_vencimiento ASC
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener productos próximos a vencer (30 días)
  obtenerProductosProximosVencer: async () => {
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
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener estadísticas de inventario
  obtenerEstadisticas: async () => {
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
    
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloInventario;