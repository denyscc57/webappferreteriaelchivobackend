const express = require('express');
const router = express.Router();
const ControladorProveedor = require('../controladores/ControladorProveedor');

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

module.exports = router;