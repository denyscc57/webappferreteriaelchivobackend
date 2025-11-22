import express from 'express';
import ControladorReportes from '../controladores/ControladorReportes.js';

const router = express.Router();

// Rutas para reportes
router.get('/productos/lote', ControladorReportes.obtenerProductosPorLote);
router.get('/productos/lote-fecha', ControladorReportes.obtenerProductosPorLoteYFecha);
router.get('/ventas/fecha', ControladorReportes.obtenerVentasPorFecha);
router.get('/ventas/generales', ControladorReportes.obtenerVentasGenerales);
router.get('/ventas/factura/:factura', ControladorReportes.obtenerVentaPorFactura);
router.get('/inventario/movimientos', ControladorReportes.obtenerMovimientosInventario);
router.get('/productos/vencimiento', ControladorReportes.obtenerProductosPorVencimiento);

export default router;