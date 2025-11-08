const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/BaseDatos');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PUERTO = process.env.PUERTO || 5000;

// Middleware CORS configurado correctamente
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas (se mantienen igual)
app.use('/api/autenticacion', require('./rutas/RutaAutenticacion'));
app.use('/api/productos', require('./rutas/RutaProducto'));
app.use('/api/inventario', require('./rutas/RutaInventario'));
app.use('/api/usuarios', require('./rutas/RutaUsuario'));
app.use('/api/ventas', require('./rutas/RutaVenta'));
app.use('/api/clientes', require('./rutas/RutaCliente'));
app.use('/api/estadisticas', require('./rutas/RutaEstadistica'));
app.use('/api/proveedores', require('./rutas/RutaProveedor'));
app.use('/api/lotes', require('./rutas/RutaLote'));
app.use('/api/unidadesmedidas', require('./rutas/RutaUnidadMedida'));
app.use('/api/caja', require('./rutas/RutaCaja'));
app.use('/api/reportes', require('./rutas/RutaReportes'));

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    mensaje: 'API de Ferretería El Chivo funcionando',
    version: '1.0.0',
    fecha: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Bienvenido al API de Ferretería El Chivo',
    endpoints: {
      autenticacion: '/api/autenticacion',
      productos: '/api/productos',
      inventario: '/api/inventario',
      usuarios: '/api/usuarios',
      ventas: '/api/ventas',
      clientes: '/api/clientes',
      proveedores: '/api/proveedores',
      lotes: '/api/lotes',
      unidadesmedidas: '/api/unidadesmedidas',
      caja: '/api/caja',
      reportes: '/api/reportes',
    }
  });
});

// Probar conexión a base de datos (ADAPTADO PARA POOL)
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
  connection.release(); // Liberar la conexión de prueba
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    mensaje: `La ruta ${req.originalUrl} no existe en este servidor`,
    sugerencia: 'Verifique la URL e intente nuevamente'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error inesperado'
  });
});

app.listen(PUERTO, () => {
  console.log(`Servidor ejecutándose en el puerto ${PUERTO}`);
  console.log(`URL: http://localhost:${PUERTO}`);
  console.log(`Frontend esperado en: http://localhost:3000`);
});