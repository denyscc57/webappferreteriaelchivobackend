const express = require('express');
const router = express.Router();
const ControladorUsuario = require('../controladores/ControladorUsuario');

// Middleware para verificar autenticación y permisos
const verificarAdmin = (req, res, next) => {
  next();
};

// Rutas para usuarios
router.post('/', verificarAdmin, ControladorUsuario.crearUsuario);
router.get('/', verificarAdmin, ControladorUsuario.obtenerUsuarios);
router.get('/:id', verificarAdmin, ControladorUsuario.obtenerUsuario);
router.put('/:id', verificarAdmin, ControladorUsuario.actualizarUsuario);
router.delete('/:id', verificarAdmin, ControladorUsuario.eliminarUsuario);
router.patch('/:id/reactivar', verificarAdmin, ControladorUsuario.reactivarUsuario);
router.put('/:id/contrasena', verificarAdmin, ControladorUsuario.cambiarContrasena);

module.exports = router;