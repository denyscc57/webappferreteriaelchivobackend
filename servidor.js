import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/BaseDatos.js';
import { PORT } from './config/Configuracion.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PUERTO = PORT;

// Importar rutas individualmente
import rutaAutenticacion from './rutas/RutaAutenticacion.js';
import rutaUsuario from './rutas/RutaUsuario.js';
import rutaProducto from './rutas/RutaProducto.js';
import rutaInventario from './rutas/RutaInventario.js';
import rutaVenta from './rutas/RutaVenta.js';
import rutaCliente from './rutas/RutaCliente.js';
import rutaEstadistica from './rutas/RutaEstadistica.js';
import rutaProveedor from './rutas/RutaProveedor.js';
import rutaLote from './rutas/RutaLote.js';
import rutaUnidadMedida from './rutas/RutaUnidadMedida.js';
import rutaCaja from './rutas/RutaCaja.js';
import rutaReportes from './rutas/RutaReportes.js';

// Middleware CORS configurado correctamente
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/autenticacion', rutaAutenticacion);
app.use('/api/usuarios', rutaUsuario);
app.use('/api/productos', rutaProducto);
app.use('/api/inventario', rutaInventario);
app.use('/api/ventas', rutaVenta);
app.use('/api/clientes', rutaCliente);
app.use('/api/estadisticas', rutaEstadistica);
app.use('/api/proveedores', rutaProveedor);
app.use('/api/lotes', rutaLote);
app.use('/api/unidadesmedidas', rutaUnidadMedida);
app.use('/api/caja', rutaCaja);
app.use('/api/reportes', rutaReportes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    mensaje: 'API de Ferretería El Chivo funcionando',
    version: '1.0.0',
    fecha: new Date().toISOString(),
    endpoints: {
      autenticacion: '/api/autenticacion',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      inventario: '/api/inventario',
      ventas: '/api/ventas',
      clientes: '/api/clientes',
      estadisticas: '/api/estadisticas',
      proveedores: '/api/proveedores',
      lotes: '/api/lotes',
      unidadesmedidas: '/api/unidadesmedidas',
      caja: '/api/caja',
      reportes: '/api/reportes'
    }
  });
});
// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Bienvenido al API de Ferretería El Chivo',
    endpoints: {
      autenticacion: '/api/autenticacion',
      usuarios: '/api/usuarios',
      productos: '/api/productos',
      inventario: '/api/inventario',
      ventas: '/api/ventas',
      clientes: '/api/clientes',
      estadisticas: '/api/estadisticas',
      proveedores: '/api/proveedores',
      lotes: '/api/lotes',
      unidadesmedidas: '/api/unidadesmedidas',
      caja: '/api/caja',
      reportes: '/api/reportes'
    }
  });
});

// Probar conexión a base de datos
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado a la base de datos MySQL');
    connection.release();
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.message);
  }
};

testDatabaseConnection();

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

export default app;