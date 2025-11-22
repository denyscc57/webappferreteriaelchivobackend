import express from 'express';
import ControladorLote from '../controladores/ControladorLote.js';

const router = express.Router();

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  // Lógica de verificación de autenticación
  next();
};

// Rutas para lotes
router.get('/', ControladorLote.obtenerLotes);
router.get('/con-productos', ControladorLote.obtenerLotesConProductos);
router.get('/estadisticas', verificarAutenticacion, ControladorLote.obtenerEstadisticas);
router.get('/buscar', ControladorLote.buscarLotes);
router.get('/:id', ControladorLote.obtenerLote);
router.get('/codigo/:codigo', ControladorLote.obtenerPorCodigo);
router.post('/', verificarAutenticacion, ControladorLote.crearLote);
router.put('/:id', verificarAutenticacion, ControladorLote.actualizarLote);
router.delete('/:id', verificarAutenticacion, ControladorLote.eliminarLote);
router.get('/:id/productos', ControladorLote.obtenerProductosPorLote);

export default router;