const ModeloReportes = require('../modelos/ModeloReportes');

const ControladorReportes = {
  // Productos por lote
  obtenerProductosPorLote: (req, res) => {
    const { lote } = req.query;

    ModeloReportes.obtenerProductosPorLote(lote, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Productos por lote y fecha
  obtenerProductosPorLoteYFecha: (req, res) => {
    const { lote, fecha_inicio, fecha_fin } = req.query;

    ModeloReportes.obtenerProductosPorLoteYFecha(lote, fecha_inicio, fecha_fin, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Ventas por fecha
  obtenerVentasPorFecha: (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    ModeloReportes.obtenerVentasPorFecha(fecha_inicio, fecha_fin, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Calcular total de ventas
      const totalVentas = resultados.reduce((sum, venta) => sum + parseFloat(venta.v_total), 0);
      
      res.json({
        ventas: resultados,
        total: totalVentas,
        cantidad: resultados.length
      });
    });
  },

  // Ventas generales
  obtenerVentasGenerales: (req, res) => {
    ModeloReportes.obtenerVentasGenerales((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Calcular total de ventas
      const totalVentas = resultados.reduce((sum, venta) => sum + parseFloat(venta.v_total), 0);
      
      res.json({
        ventas: resultados,
        total: totalVentas,
        cantidad: resultados.length
      });
    });
  },

  // Buscar venta por factura
  obtenerVentaPorFactura: (req, res) => {
    const { factura } = req.params;

    ModeloReportes.obtenerVentaPorFactura(factura, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      res.json(resultados[0]);
    });
  },

  // Movimientos de inventario
  obtenerMovimientosInventario: (req, res) => {
    const { tipo, fecha_inicio, fecha_fin } = req.query;

    ModeloReportes.obtenerMovimientosInventario(tipo, fecha_inicio, fecha_fin, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Productos por vencimiento
  obtenerProductosPorVencimiento: (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    ModeloReportes.obtenerProductosPorVencimiento(fecha_inicio, fecha_fin, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  }
};

module.exports = ControladorReportes;