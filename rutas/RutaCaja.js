import express from 'express';
import ControladorCaja from '../controladores/ControladorCaja.js';


const router = express.Router();

// Middleware IDÉNTICO al de RutaInventario.js
const verificarAutenticacion = (req, res, next) => {
  try {
    // Obtener el id_usuario del body de la petición (igual que en inventario)
    req.userId = req.body.id_usuario;
    
    if (!req.userId) {
      return res.status(400).json({ error: 'id_usuario es requerido en el body' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Error de autenticación' });
  }
};

// Aplicar middleware de autenticación SOLO a rutas POST/PUT que necesitan el userId
router.post('/abrir', verificarAutenticacion, ControladorCaja.abrirCaja);
router.put('/cerrar/:id', verificarAutenticacion, ControladorCaja.cerrarCaja);

// Las rutas GET (solo lectura) NO usan el middleware para no requerir body
router.get('/abierta', (req, res, next) => {
  // Para GET, obtener id_usuario de query parameters
  req.userId = req.query.id_usuario;
  if (!req.userId) {
    return res.status(400).json({ error: 'id_usuario es requerido en query parameters' });
  }
  next();
}, ControladorCaja.obtenerCajaAbierta);

// NUEVA RUTA: Obtener última caja abierta (sin requerir id_usuario)
router.get('/ultima-abierta', ControladorCaja.obtenerUltimaCajaAbierta);

router.get('/:id', (req, res, next) => {
  req.userId = req.query.id_usuario;
  if (!req.userId) {
    return res.status(400).json({ error: 'id_usuario es requerido en query parameters' });
  }
  next();
}, ControladorCaja.obtenerCaja);

router.get('/', (req, res, next) => {
  req.userId = req.query.id_usuario;
  next();
}, ControladorCaja.obtenerCajas);

router.get('/estadisticas/estadisticas', (req, res, next) => {
  req.userId = req.query.id_usuario;
  next();
}, ControladorCaja.obtenerEstadisticas);

export default router;