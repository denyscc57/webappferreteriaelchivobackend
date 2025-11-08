const ModeloUsuario = require('../modelos/ModeloUsuario');

const ControladorUsuario = {
  // Crear un nuevo usuario
  crearUsuario: (req, res) => {
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena } = req.body;
    
    // Primero verificar si el email ya existe
    ModeloUsuario.verificarEmailExistente(email, null, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Verificar si la identificación ya existe
      ModeloUsuario.verificarIdentificacionExistente(identificacion, null, (err, resultadosId) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (resultadosId[0].count > 0) {
          return res.status(400).json({ error: 'La identificación ya está registrada' });
        }
        
        // Crear el usuario
        ModeloUsuario.crear({
          nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena
        }, (err, resultados) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ 
            mensaje: 'Usuario creado exitosamente', 
            id: resultados.insertId 
          });
        });
      });
    });
  },

  // Obtener todos los usuarios
  obtenerUsuarios: (req, res) => {
    ModeloUsuario.obtenerTodos((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Obtener usuario por ID
  obtenerUsuario: (req, res) => {
    const id = req.params.id;
    
    ModeloUsuario.obtenerPorId(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  // Actualizar usuario
  actualizarUsuario: (req, res) => {
    const id = req.params.id;
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena } = req.body;
    
    // Verificar si el email ya existe (excluyendo el usuario actual)
    ModeloUsuario.verificarEmailExistente(email, id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Verificar si la identificación ya existe (excluyendo el usuario actual)
      ModeloUsuario.verificarIdentificacionExistente(identificacion, id, (err, resultadosId) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        if (resultadosId[0].count > 0) {
          return res.status(400).json({ error: 'La identificación ya está registrada' });
        }
        
        // Actualizar el usuario
        const usuarioData = {
          nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
        };
        
        if (contrasena) {
          usuarioData.contrasena = contrasena;
        }
        
        ModeloUsuario.actualizar(id, usuarioData, (err, resultados) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (resultados.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
          }
          res.json({ mensaje: 'Usuario actualizado exitosamente' });
        });
      });
    });
  },

  // Eliminar usuario (desactivar)
  eliminarUsuario: (req, res) => {
    const id = req.params.id;
    
    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }
    
    ModeloUsuario.eliminar(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario desactivado exitosamente' });
    });
  },

  // Reactivar usuario
  reactivarUsuario: (req, res) => {
    const id = req.params.id;
    
    ModeloUsuario.reactivar(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario reactivado exitosamente' });
    });
  },

  // Obtener estadísticas de usuarios
  obtenerEstadisticas: (req, res) => {
    ModeloUsuario.obtenerEstadisticas((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados[0]);
    });
  },
   // Método para cambiar contraseña
  cambiarContrasena: (req, res) => {
    const id = req.params.id;
    const { contrasena } = req.body;
    
    if (!contrasena || contrasena.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
    }
    
    ModeloUsuario.cambiarContrasena(id, contrasena, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Contraseña cambiada exitosamente' });
    });
  }
};

module.exports = ControladorUsuario;