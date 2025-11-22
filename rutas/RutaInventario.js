import express from 'express';
import ControladorInventario from'../controladores/ControladorInventario.js';

const router = express.Router();

// Middleware para verificar autenticación básica
const verificarAutenticacion = (req, res, next) => {
  try {
    // Obtener el id_usuario del body de la petición
    req.userId = req.body.id_usuario;
    
    if (!req.userId) {
      return res.status(400).json({ error: 'id_usuario es requerido en el body' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

// Aplicar middleware de autenticación solo a la ruta que necesita el userId
router.post('/movimientos', verificarAutenticacion, ControladorInventario.registrarMovimiento);

// Las demás rutas (solo lectura) no necesitan el middleware
router.get('/movimientos', ControladorInventario.obtenerMovimientos);
router.get('/movimientos/:id', ControladorInventario.obtenerMovimiento);
router.get('/producto/:id/historial', ControladorInventario.obtenerHistorialProducto);
router.get('/producto/:id/kardex', ControladorInventario.obtenerKardexProducto);
router.get('/alertas/stock-bajo', ControladorInventario.obtenerProductosStockBajo);
router.get('/alertas/vencimiento', ControladorInventario.obtenerProductosProximosVencer);
router.get('/estadisticas', ControladorInventario.obtenerEstadisticas);

export default router;