import ModeloEstadisticas from '../modelos/ModeloEstadisticas.js';

const ControladorEstadisticas = {
  obtenerResumen: async (req, res) => {
    try {
      const resultados = await ModeloEstadisticas.obtenerResumen();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo resumen:', error);
      res.status(500).json({ 
        totalProductos: 0,
        totalVentasHoy: 0,
        totalUsuariosActivos: 0,
        productosStockBajo: 0
      });
    }
  },

  obtenerVentasSemana: async (req, res) => {
    try {
      const resultados = await ModeloEstadisticas.obtenerVentasSemana();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo ventas de la semana:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerProductosPopulares: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const resultados = await ModeloEstadisticas.obtenerProductosPopulares(limit);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos populares:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerEstadisticasMensuales: async (req, res) => {
    try {
      const resultados = await ModeloEstadisticas.obtenerEstadisticasMensuales();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo estadísticas mensuales:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerAlertas: async (req, res) => {
    try {
      const resultados = await ModeloEstadisticas.obtenerAlertas();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      res.status(500).json({ error: 'Error al obtener alertas' });
    }
  }
};

export default ControladorEstadisticas;