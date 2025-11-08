const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/BaseDatos');
const crypto = require('crypto');

// Ruta para login
router.post('/login', (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Aplicar MD5 a la contraseña recibida
  const contrasenaMD5 = crypto.createHash('md5').update(contrasena).digest('hex');

  // Buscar usuario por email
  const query = 'SELECT * FROM usuario WHERE u_email = ? AND u_activo = TRUE';
  db.query(query, [email], (err, resultados) => {
    if (err) {
      console.error('Error en login:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = resultados[0];

    // Verificar contraseña con MD5
    if (contrasenaMD5 === usuario.u_contrasena) {
      // Crear token JWT
      const token = jwt.sign(
        { 
          id: usuario.u_id, 
          email: usuario.u_email, 
          tipo: usuario.u_tipo,
          nombres: usuario.u_nombres,
          apellidos: usuario.u_apellidos
        },
        process.env.JWT_SECRET || '12345',
        { expiresIn: process.env.JWT_EXPIRE || '8h' }
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
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

// Ruta para verificar token y obtener datos de usuario
router.get('/verificar', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '12345');
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

module.exports = router;