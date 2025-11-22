import express from 'express';
import ControladorEstadisticas from '../controladores/ControladorEstadisticas.js';
const router = express.Router();

router.get('/resumen', ControladorEstadisticas.obtenerResumen);
router.get('/ventas-semana', ControladorEstadisticas.obtenerVentasSemana);
router.get('/productos-populares', ControladorEstadisticas.obtenerProductosPopulares);
router.get('/estadisticas-mensuales', ControladorEstadisticas.obtenerEstadisticasMensuales);
router.get('/alertas', ControladorEstadisticas.obtenerAlertas);

export default router;