const express = require('express');
const router = express.Router();
const ControladorVenta = require('../controladores/ControladorVenta');

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  try {
    req.userId = req.body.id_usuario || 1; // Valor por defecto para testing
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rutas para ventas
router.post('/venta', verificarAutenticacion, ControladorVenta.crearVenta);
router.get('/venta', verificarAutenticacion, ControladorVenta.obtenerVentas);
router.get('/venta/:id', verificarAutenticacion, ControladorVenta.obtenerVenta);
router.get('/venta/estadisticas', verificarAutenticacion, ControladorVenta.obtenerEstadisticas);

module.exports = router;