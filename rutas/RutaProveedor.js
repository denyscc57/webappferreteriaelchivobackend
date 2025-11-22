import express from 'express';
import ControladorProveedor from '../controladores/ControladorProveedor.js';
const router = express.Router();

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  // Lógica de verificación de autenticación
  next();
};

// Rutas para proveedores
router.get('/', ControladorProveedor.obtenerProveedores);
router.get('/estadisticas', verificarAutenticacion, ControladorProveedor.obtenerEstadisticas);
router.get('/buscar', ControladorProveedor.buscarProveedores);
router.get('/tipo/:tipo', ControladorProveedor.obtenerProveedoresPorTipo);
router.get('/:id', ControladorProveedor.obtenerProveedor);
router.post('/', verificarAutenticacion, ControladorProveedor.crearProveedor);
router.put('/:id', verificarAutenticacion, ControladorProveedor.actualizarProveedor);
router.delete('/:id', verificarAutenticacion, ControladorProveedor.eliminarProveedor);
router.get('/identificacion/:identificacion', verificarAutenticacion, ControladorProveedor.obtenerPorIdentificacion);

export default router;