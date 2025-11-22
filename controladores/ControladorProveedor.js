import ModeloProveedor from '../modelos/ModeloProveedor.js';

const ControladorProveedor = {
  crearProveedor: async (req, res) => {
    try {
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
      
      // Validaciones básicas
      if (!nombres || !apellidos || !identificacion) {
        return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
      }

      // Verificar si la identificación ya existe
      const resultadosVerificacion = await ModeloProveedor.verificarIdentificacionExistente(identificacion, null);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Crear el proveedor
      const resultadoCreacion = await ModeloProveedor.crear({
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      });
      
      res.status(201).json({ 
        mensaje: 'Proveedor creado exitosamente', 
        id: resultadoCreacion.insertId 
      });
    } catch (error) {
      console.error('Error creando proveedor:', error);
      
      // Manejar error de duplicado de identificación
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      res.status(500).json({ error: 'Error al crear el proveedor' });
    }
  },

  obtenerProveedores: async (req, res) => {
    try {
      const resultados = await ModeloProveedor.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      res.status(500).json({ error: 'Error al obtener proveedores' });
    }
  },

  obtenerProveedor: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloProveedor.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo proveedor:', error);
      res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
  },

  actualizarProveedor: async (req, res) => {
    try {
      const id = req.params.id;
      const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
      
      // Validaciones básicas
      if (!nombres || !apellidos || !identificacion) {
        return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
      }

      // Verificar si la identificación ya existe (excluyendo el proveedor actual)
      const resultadosVerificacion = await ModeloProveedor.verificarIdentificacionExistente(identificacion, id);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Actualizar el proveedor
      const resultadoActualizacion = await ModeloProveedor.actualizar(id, {
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      });
      
      if (resultadoActualizacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
      }
      res.json({ mensaje: 'Proveedor actualizado exitosamente' });
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      
      // Manejar error de duplicado de identificación
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
  },

  eliminarProveedor: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloProveedor.eliminar(id);
      
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
      }
      res.json({ mensaje: 'Proveedor eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando proveedor:', error);
      res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
  },

  buscarProveedores: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino || termino.trim() === '') {
        return res.status(400).json({ error: 'Término de búsqueda requerido' });
      }
      
      const resultados = await ModeloProveedor.buscar(termino.trim());
      res.json(resultados);
    } catch (error) {
      console.error('Error buscando proveedores:', error);
      res.status(500).json({ error: 'Error al buscar proveedores' });
    }
  },

  obtenerProveedoresPorTipo: async (req, res) => {
    try {
      const { tipo } = req.params;
      const resultados = await ModeloProveedor.obtenerPorTipo(tipo);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo proveedores por tipo:', error);
      res.status(500).json({ error: 'Error al obtener proveedores por tipo' });
    }
  },

  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloProveedor.obtenerEstadisticas();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerPorIdentificacion: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const resultados = await ModeloProveedor.obtenerPorIdentificacion(identificacion);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo proveedor por identificación:', error);
      res.status(500).json({ error: 'Error al obtener el proveedor' });
    }
  }
};

export default ControladorProveedor;