const db = require('../config/BaseDatos');

const ModeloEstadisticas = {
  // Obtener resumen general del sistema (adaptado a tu estructura)
  obtenerResumen: (callback) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM producto) as totalProductos,
        (SELECT COUNT(*) FROM venta WHERE v_fecha = CURDATE()) as totalVentasHoy,
        (SELECT COUNT(*) FROM usuario) as totalUsuariosActivos,
        (SELECT COUNT(*) FROM producto WHERE p_stock <= 10) as productosStockBajo
    `;
    
    db.query(query, (err, resultados) => {
      if (err) {
        console.error('Error en obtenerResumen:', err);
        return callback(err);
      }
      callback(null, resultados[0]);
    });
  },

  // Obtener ventas por día de la semana actual
  obtenerVentasSemana: (callback) => {
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
    
    db.query(query, callback);
  },

  // Obtener productos más vendidos
  obtenerProductosPopulares: (limit = 5, callback) => {
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
    
    db.query(query, [limit], callback);
  },

  // Obtener estadísticas mensuales
  obtenerEstadisticasMensuales: (callback) => {
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
    
    db.query(query, callback);
  },

  // Obtener alertas del sistema (adaptado a tu estructura)
  obtenerAlertas: (callback) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM producto WHERE p_stock <= 10) as stock_bajo,
        (SELECT COUNT(*) FROM producto WHERE p_fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND p_fecha_vencimiento >= CURDATE()) as proximos_vencer,
        (SELECT COUNT(*) FROM producto WHERE p_fecha_vencimiento < CURDATE()) as vencidos
    `;
    
    db.query(query, (err, resultados) => {
      if (err) {
        console.error('Error en obtenerAlertas:', err);
        return callback(err);
      }
      callback(null, resultados[0]);
    });
  },

  // Obtener total de clientes
  obtenerTotalClientes: (callback) => {
    const query = 'SELECT COUNT(*) as total FROM cliente';
    db.query(query, callback);
  },

  // Obtener ingresos del día
  obtenerIngresosHoy: (callback) => {
    const query = 'SELECT SUM(v_total) as total FROM venta WHERE v_fecha = CURDATE()';
    db.query(query, callback);
  }
};

module.exports = ModeloEstadisticas;