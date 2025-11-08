const express = require('express');
const router = express.Router();
const ControladorEstadisticas = require('../controladores/ControladorEstadisticas');

router.get('/resumen', ControladorEstadisticas.obtenerResumen);
router.get('/ventas-semana', ControladorEstadisticas.obtenerVentasSemana);
router.get('/productos-populares', ControladorEstadisticas.obtenerProductosPopulares);
router.get('/estadisticas-mensuales', ControladorEstadisticas.obtenerEstadisticasMensuales);
router.get('/alertas', ControladorEstadisticas.obtenerAlertas);

module.exports = router;