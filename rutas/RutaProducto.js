const express = require('express');
const router = express.Router();
const ControladorProducto = require('../controladores/ControladorProducto');

// Middleware para verificar autenticación
const verificarAutenticacion = (req, res, next) => {
  // Lógica de verificación de autenticación
  next();
};

// Rutas para productos
router.get('/', ControladorProducto.obtenerProductos);
router.get('/buscar', ControladorProducto.buscarProductos);
router.get('/categoria/:categoria', ControladorProducto.obtenerProductosPorCategoria);
router.get('/:id', ControladorProducto.obtenerProducto);
router.post('/', verificarAutenticacion, ControladorProducto.crearProducto);
router.put('/:id', verificarAutenticacion, ControladorProducto.actualizarProducto);
router.delete('/:id', verificarAutenticacion, ControladorProducto.eliminarProducto);

// Nuevas rutas para verificación de uso
router.get('/:id/verificar-ventas', verificarAutenticacion, ControladorProducto.verificarUsoEnVentas);
router.get('/:id/verificar-inventario', verificarAutenticacion, ControladorProducto.verificarUsoEnInventario);

module.exports = router;