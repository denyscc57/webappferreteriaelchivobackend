import ModeloCliente from '../modelos/ModeloCliente.js';

const ControladorCliente = {
  crearCliente: async (req, res) => {
    try {
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
      
      // Validaciones básicas
      if (!nombres || !apellidos || !identificacion) {
        return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
      }

      // Verificar si la identificación ya existe
      const resultados = await ModeloCliente.verificarIdentificacionExistente(identificacion, null);
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Crear el cliente
      const resultadoCreacion = await ModeloCliente.crear({
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      });
      
      res.status(201).json({ 
        mensaje: 'Cliente creado exitosamente', 
        id: resultadoCreacion.insertId 
      });
    } catch (error) {
      console.error('Error creando cliente:', error);
      
      // Manejar error de duplicado de identificación
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      res.status(500).json({ error: 'Error al crear el cliente' });
    }
  },

  obtenerClientes: async (req, res) => {
    try {
      const resultados = await ModeloCliente.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  },

  obtenerCliente: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloCliente.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  },

  actualizarCliente: async (req, res) => {
    try {
      const id = req.params.id;
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
      
      // Validaciones básicas
      if (!nombres || !apellidos || !identificacion) {
        return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
      }

      // Verificar si la identificación ya existe (excluyendo el cliente actual)
      const resultados = await ModeloCliente.verificarIdentificacionExistente(identificacion, id);
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Actualizar el cliente
      const resultadoActualizacion = await ModeloCliente.actualizar(id, {
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      });
      
      if (resultadoActualizacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.json({ mensaje: 'Cliente actualizado exitosamente' });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      
      // Manejar error de duplicado de identificación
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
  },

  eliminarCliente: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloCliente.eliminar(id);
      
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.json({ mensaje: 'Cliente eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
  },

  buscarClientes: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino || termino.trim() === '') {
        return res.status(400).json({ error: 'Término de búsqueda requerido' });
      }
      
      const resultados = await ModeloCliente.buscar(termino.trim());
      res.json(resultados);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      res.status(500).json({ error: 'Error al buscar clientes' });
    }
  },

  obtenerClientesPorTipo: async (req, res) => {
    try {
      const { tipo } = req.params;
      const resultados = await ModeloCliente.obtenerPorTipo(tipo);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo clientes por tipo:', error);
      res.status(500).json({ error: 'Error al obtener clientes por tipo' });
    }
  },

  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloCliente.obtenerEstadisticas();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerPorIdentificacion: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const resultados = await ModeloCliente.obtenerPorIdentificacion(identificacion);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo cliente por identificación:', error);
      res.status(500).json({ error: 'Error al obtener el cliente' });
    }
  }
};

export default ControladorCliente;