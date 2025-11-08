const express = require('express');
const router = express.Router();
const ControladorReportes = require('../controladores/ControladorReportes');

// Rutas para reportes
router.get('/productos/lote', ControladorReportes.obtenerProductosPorLote);
router.get('/productos/lote-fecha', ControladorReportes.obtenerProductosPorLoteYFecha);
router.get('/ventas/fecha', ControladorReportes.obtenerVentasPorFecha);
router.get('/ventas/generales', ControladorReportes.obtenerVentasGenerales);
router.get('/ventas/factura/:factura', ControladorReportes.obtenerVentaPorFactura);
router.get('/inventario/movimientos', ControladorReportes.obtenerMovimientosInventario);
router.get('/productos/vencimiento', ControladorReportes.obtenerProductosPorVencimiento);

module.exports = router;