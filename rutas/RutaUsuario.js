import express from 'express';
import ControladorUsuario from '../controladores/ControladorUsuario.js';

const router = express.Router();

// Middleware para verificar autenticación y permisos
const verificarAdmin = (req, res, next) => {
  // Aquí iría la lógica para verificar si el usuario es administrador
  // Por ahora asumimos que el middleware de autenticación ya verificó el token
  next();
};

// Rutas para usuarios
router.post('/', verificarAdmin, ControladorUsuario.crearUsuario);
router.get('/', verificarAdmin, ControladorUsuario.obtenerUsuarios);
router.get('/:id', verificarAdmin, ControladorUsuario.obtenerUsuario);
router.put('/:id', verificarAdmin, ControladorUsuario.actualizarUsuario);
router.delete('/:id', verificarAdmin, ControladorUsuario.eliminarUsuario);
router.patch('/:id/reactivar', verificarAdmin, ControladorUsuario.reactivarUsuario);

export default router;