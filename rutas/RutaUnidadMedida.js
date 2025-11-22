import express from 'express';
import ControladorUnidadMedida from '../controladores/ControladorUnidadMedida.js';

const router = express.Router();

// Middleware para verificar autenticación y permisos de administrador
const verificarAdmin = (req, res, next) => {
  next();
};

// Rutas para unidades de medida (solo administradores)
router.get('/', ControladorUnidadMedida.obtenerUnidades);
router.get('/buscar', ControladorUnidadMedida.buscarUnidades);
router.get('/:id', ControladorUnidadMedida.obtenerUnidad);
router.post('/', verificarAdmin, ControladorUnidadMedida.crearUnidad);
router.put('/:id', verificarAdmin, ControladorUnidadMedida.actualizarUnidad);
router.delete('/:id', verificarAdmin, ControladorUnidadMedida.eliminarUnidad);

export default router;