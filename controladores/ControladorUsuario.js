import ModeloUsuario from '../modelos/ModeloUsuario.js';

const ControladorUsuario = {
  // Crear un nuevo usuario
  crearUsuario: async (req, res) => {
    try {
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena } = req.body;
      
      // Primero verificar si el email ya existe
      const resultadosEmail = await ModeloUsuario.verificarEmailExistente(email, null);
      if (resultadosEmail[0].count > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Verificar si la identificación ya existe
      const resultadosId = await ModeloUsuario.verificarIdentificacionExistente(identificacion, null);
      if (resultadosId[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya está registrada' });
      }
      
      // Crear el usuario
      const resultados = await ModeloUsuario.crear({
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena
      });
      
      res.status(201).json({ 
        mensaje: 'Usuario creado exitosamente', 
        id: resultados.insertId 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los usuarios
  obtenerUsuarios: async (req, res) => {
    try {
      const resultados = await ModeloUsuario.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener usuario por ID
  obtenerUsuario: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloUsuario.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar usuario
  actualizarUsuario: async (req, res) => {
    try {
      const id = req.params.id;
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo, contrasena } = req.body;
      
      // Verificar si el email ya existe (excluyendo el usuario actual)
      const resultadosEmail = await ModeloUsuario.verificarEmailExistente(email, id);
      if (resultadosEmail[0].count > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      // Verificar si la identificación ya existe (excluyendo el usuario actual)
      const resultadosId = await ModeloUsuario.verificarIdentificacionExistente(identificacion, id);
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
      
      const resultados = await ModeloUsuario.actualizar(id, usuarioData);
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar usuario (desactivar)
  eliminarUsuario: async (req, res) => {
    try {
      const id = req.params.id;
      
      // No permitir eliminar el propio usuario
      if (parseInt(id) === req.userId) {
        return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
      }
      
      const resultados = await ModeloUsuario.eliminar(id);
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario desactivado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Reactivar usuario
  reactivarUsuario: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloUsuario.reactivar(id);
      
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }
      res.json({ mensaje: 'Usuario reactivado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener estadísticas de usuarios
  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloUsuario.obtenerEstadisticas();
      res.json(resultados[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default ControladorUsuario;