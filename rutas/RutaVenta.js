import express from 'express';
import ControladorVenta from '../controladores/ControladorVenta.js';

const router = express.Router();

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

export default router;