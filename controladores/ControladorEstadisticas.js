const ModeloEstadisticas = require('../modelos/ModeloEstadisticas');

const ControladorEstadisticas = {
  obtenerResumen: async (req, res) => {
    try {
      ModeloEstadisticas.obtenerResumen((err, resultados) => {
        if (err) {
          console.error('Error obteniendo resumen:', err);
          return res.status(500).json({ 
            totalProductos: 0,
            totalVentasHoy: 0,
            totalUsuariosActivos: 0,
            productosStockBajo: 0
          });
        }
        res.json(resultados);
      });
    } catch (error) {
      console.error('Error en obtenerResumen:', error);
      res.json({
        totalProductos: 0,
        totalVentasHoy: 0,
        totalUsuariosActivos: 0,
        productosStockBajo: 0
      });
    }
  },

  obtenerVentasSemana: (req, res) => {
    ModeloEstadisticas.obtenerVentasSemana((err, resultados) => {
      if (err) {
        console.error('Error obteniendo ventas de la semana:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados);
    });
  },

  obtenerProductosPopulares: (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    ModeloEstadisticas.obtenerProductosPopulares(limit, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo productos populares:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados);
    });
  },

  obtenerEstadisticasMensuales: (req, res) => {
    ModeloEstadisticas.obtenerEstadisticasMensuales((err, resultados) => {
      if (err) {
        console.error('Error obteniendo estadísticas mensuales:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados);
    });
  },

  obtenerAlertas: (req, res) => {
    ModeloEstadisticas.obtenerAlertas((err, resultados) => {
      if (err) {
        console.error('Error obteniendo alertas:', err);
        return res.status(500).json({ error: 'Error al obtener alertas' });
      }
      res.json(resultados);
    });
  }
};

module.exports = ControladorEstadisticas;