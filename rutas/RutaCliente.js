const express = require('express');
const router = express.Router();
const ControladorCliente = require('../controladores/ControladorCliente');

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  // Lógica de verificación de autenticación
  next();
};

// Rutas para clientes
router.get('/', ControladorCliente.obtenerClientes);
router.get('/estadisticas', verificarAutenticacion, ControladorCliente.obtenerEstadisticas);
router.get('/buscar', ControladorCliente.buscarClientes);
router.get('/tipo/:tipo', ControladorCliente.obtenerClientesPorTipo);
router.get('/:id', ControladorCliente.obtenerCliente);
router.post('/', verificarAutenticacion, ControladorCliente.crearCliente);
router.put('/:id', verificarAutenticacion, ControladorCliente.actualizarCliente);
router.delete('/:id', verificarAutenticacion, ControladorCliente.eliminarCliente);
router.get('/identificacion/:identificacion', verificarAutenticacion, ControladorCliente.obtenerPorIdentificacion);
module.exports = router;