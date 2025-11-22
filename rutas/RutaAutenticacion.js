import express from 'express';
import jwt from 'jsonwebtoken';
import ModeloUsuario from '../modelos/ModeloUsuario.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/Configuracion.js';

const router = express.Router();

 
// Ruta para login

router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    console.log('Intento de login con:', { email, contrasena });

    if (!email || !contrasena) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario por email usando el modelo
    const resultados = await ModeloUsuario.obtenerPorEmail(email);
    console.log('Usuarios activos encontrados:', resultados.length);
    
    if (resultados.length === 0) {
      console.log('No se encontró usuario activo con email:', email);
      return res.status(401).json({ error: 'Email y/o contraseña Incorrecto' });
    }

    const usuario = resultados[0];
    console.log('Usuario encontrado:', {
      id: usuario.u_id,
      email: usuario.u_email,
      activo: usuario.u_activo
    });

    const contrasenaMD5 = ModeloUsuario.generarMD5(contrasena);

    if (contrasenaMD5 === usuario.u_contrasena) {
      const token = jwt.sign(
        { 
          id: usuario.u_id, 
          email: usuario.u_email, 
          tipo: usuario.u_tipo,
          nombres: usuario.u_nombres,
          apellidos: usuario.u_apellidos
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.u_id,
          nombres: usuario.u_nombres,
          apellidos: usuario.u_apellidos,
          email: usuario.u_email,
          tipo: usuario.u_tipo,
          tipoTexto: obtenerTipoUsuario(usuario.u_tipo)
        }
      });
    } else {
      console.log('Contraseña no coincide para usuario:', usuario.u_email);
      res.status(401).json({ error: 'Email y/o contraseña Incorrecto' });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Ruta para verificar token y obtener datos de usuario
router.get('/verificar', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valido: true, usuario: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Función para obtener texto del tipo de usuario
function obtenerTipoUsuario(tipo) {
  const tipos = {
    1: 'Administrador',
    2: 'Bodega',
    3: 'Vendedor'
  };
  return tipos[tipo] || 'Usuario';
}

export default router;
