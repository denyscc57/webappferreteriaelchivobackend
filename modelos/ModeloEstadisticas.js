import { pool } from '../config/BaseDatos.js';

const ModeloEstadisticas = {
  // Obtener resumen general del sistema
  obtenerResumen: async () => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM producto) as totalProductos,
        (SELECT COUNT(*) FROM venta WHERE v_fecha = CURDATE()) as totalVentasHoy,
        (SELECT COUNT(*) FROM usuario) as totalUsuariosActivos,
        (SELECT COUNT(*) FROM producto WHERE p_stock <= 10) as productosStockBajo
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener ventas por día de la semana actual
  obtenerVentasSemana: async () => {
    const query = `
      SELECT 
        DAYNAME(v_fecha) as dia,
        COUNT(*) as cantidad,
        SUM(v_total) as total
      FROM venta 
      WHERE YEARWEEK(v_fecha) = YEARWEEK(CURDATE())
      GROUP BY DAYNAME(v_fecha), v_fecha
      ORDER BY v_fecha
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener productos más vendidos
  obtenerProductosPopulares: async (limit = 5) => {
    const query = `
      SELECT 
        v_nombre as nombre,
        v_marca as marca,
        SUM(v_cantidad) as total_vendido,
        SUM(v_total) as ingresos_totales
      FROM venta
      GROUP BY v_nombre, v_marca
      ORDER BY total_vendido DESC
      LIMIT ?
    `;
    
    const [resultados] = await pool.query(query, [limit]);
    return resultados;
  },

  // Obtener estadísticas mensuales
  obtenerEstadisticasMensuales: async () => {
    const query = `
      SELECT 
        DATE_FORMAT(v_fecha, '%Y-%m') as mes,
        COUNT(*) as total_ventas,
        SUM(v_total) as ingresos_totales,
        AVG(v_total) as promedio_venta
      FROM venta 
      WHERE v_fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(v_fecha, '%Y-%m')
      ORDER BY mes DESC
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener alertas del sistema
  obtenerAlertas: async () => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM producto WHERE p_stock <= 10) as stock_bajo,
        (SELECT COUNT(*) FROM producto WHERE p_fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND p_fecha_vencimiento >= CURDATE()) as proximos_vencer,
        (SELECT COUNT(*) FROM producto WHERE p_fecha_vencimiento < CURDATE()) as vencidos
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener total de clientes
  obtenerTotalClientes: async () => {
    const query = 'SELECT COUNT(*) as total FROM cliente';
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener ingresos del día
  obtenerIngresosHoy: async () => {
    const query = 'SELECT SUM(v_total) as total FROM venta WHERE v_fecha = CURDATE()';
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloEstadisticas;