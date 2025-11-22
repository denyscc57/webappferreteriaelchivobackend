import ModeloReportes from '../modelos/ModeloReportes.js';

const ControladorReportes = {
  // Productos por lote
  obtenerProductosPorLote: async (req, res) => {
    try {
      const { lote } = req.query;
      const resultados = await ModeloReportes.obtenerProductosPorLote(lote);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos por lote:', error);
      res.status(500).json({ error: 'Error al obtener productos por lote' });
    }
  },

  // Productos por lote y fecha
  obtenerProductosPorLoteYFecha: async (req, res) => {
    try {
      const { lote, fecha_inicio, fecha_fin } = req.query;
      const resultados = await ModeloReportes.obtenerProductosPorLoteYFecha(lote, fecha_inicio, fecha_fin);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos por lote y fecha:', error);
      res.status(500).json({ error: 'Error al obtener productos por lote y fecha' });
    }
  },

  // Ventas por fecha
  obtenerVentasPorFecha: async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const resultados = await ModeloReportes.obtenerVentasPorFecha(fecha_inicio, fecha_fin);
      
      // Calcular total de ventas
      const totalVentas = resultados.reduce((sum, venta) => sum + parseFloat(venta.v_total), 0);
      
      res.json({
        ventas: resultados,
        total: totalVentas,
        cantidad: resultados.length
      });
    } catch (error) {
      console.error('Error obteniendo ventas por fecha:', error);
      res.status(500).json({ error: 'Error al obtener ventas por fecha' });
    }
  },

  // Ventas generales
  obtenerVentasGenerales: async (req, res) => {
    try {
      const resultados = await ModeloReportes.obtenerVentasGenerales();
      
      // Calcular total de ventas
      const totalVentas = resultados.reduce((sum, venta) => sum + parseFloat(venta.v_total), 0);
      
      res.json({
        ventas: resultados,
        total: totalVentas,
        cantidad: resultados.length
      });
    } catch (error) {
      console.error('Error obteniendo ventas generales:', error);
      res.status(500).json({ error: 'Error al obtener ventas generales' });
    }
  },

  // Buscar venta por factura
  obtenerVentaPorFactura: async (req, res) => {
    try {
      const { factura } = req.params;
      const resultados = await ModeloReportes.obtenerVentaPorFactura(factura);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo venta por factura:', error);
      res.status(500).json({ error: 'Error al obtener venta por factura' });
    }
  },

  // Movimientos de inventario
  obtenerMovimientosInventario: async (req, res) => {
    try {
      const { tipo, fecha_inicio, fecha_fin } = req.query;
      const resultados = await ModeloReportes.obtenerMovimientosInventario(tipo, fecha_inicio, fecha_fin);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo movimientos de inventario:', error);
      res.status(500).json({ error: 'Error al obtener movimientos de inventario' });
    }
  },

  // Productos por vencimiento
  obtenerProductosPorVencimiento: async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const resultados = await ModeloReportes.obtenerProductosPorVencimiento(fecha_inicio, fecha_fin);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos por vencimiento:', error);
      res.status(500).json({ error: 'Error al obtener productos por vencimiento' });
    }
  }
};

export default ControladorReportes;