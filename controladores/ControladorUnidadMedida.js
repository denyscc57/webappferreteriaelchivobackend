import ModeloUnidadMedida from '../modelos/ModeloUnidadMedida.js';

const ControladorUnidadMedida = {
  crearUnidad: async (req, res) => {
    try {
      const { unidad } = req.body;
      
      // Validaciones básicas
      if (!unidad || unidad.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la unidad es obligatorio' });
      }

      // Verificar si la unidad ya existe
      const resultadosVerificacion = await ModeloUnidadMedida.verificarUnidadExistente(unidad.trim(), null);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      // Crear la unidad
      const resultadoCreacion = await ModeloUnidadMedida.crear({ unidad: unidad.trim() });
      
      res.status(201).json({ 
        mensaje: 'Unidad de medida creada exitosamente', 
        id: resultadoCreacion.insertId 
      });
    } catch (error) {
      console.error('Error creando unidad:', error);
      
      // Manejar error de duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      res.status(500).json({ error: 'Error al crear la unidad de medida' });
    }
  },

  obtenerUnidades: async (req, res) => {
    try {
      const resultados = await ModeloUnidadMedida.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo unidades:', error);
      res.status(500).json({ error: 'Error al obtener unidades de medida' });
    }
  },

  obtenerUnidad: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloUnidadMedida.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo unidad:', error);
      res.status(500).json({ error: 'Error al obtener la unidad de medida' });
    }
  },

  actualizarUnidad: async (req, res) => {
    try {
      const id = req.params.id;
      const { unidad } = req.body;
      
      // Validaciones básicas
      if (!unidad || unidad.trim() === '') {
        return res.status(400).json({ error: 'El nombre de la unidad es obligatorio' });
      }

      // Verificar si la unidad ya existe (excluyendo la unidad actual)
      const resultadosVerificacion = await ModeloUnidadMedida.verificarUnidadExistente(unidad.trim(), id);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      // Actualizar la unidad
      const resultadoActualizacion = await ModeloUnidadMedida.actualizar(id, { unidad: unidad.trim() });
      
      if (resultadoActualizacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
      }
      res.json({ mensaje: 'Unidad de medida actualizada exitosamente' });
    } catch (error) {
      console.error('Error actualizando unidad:', error);
      
      // Manejar error de duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      res.status(500).json({ error: 'Error al actualizar la unidad de medida' });
    }
  },

  eliminarUnidad: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloUnidadMedida.eliminar(id);
      
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
      }
      res.json({ mensaje: 'Unidad de medida eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminando unidad:', error);
      
      if (error.message.includes('No se puede eliminar')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Error al eliminar la unidad de medida' });
    }
  },

  buscarUnidades: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino || termino.trim() === '') {
        return res.status(400).json({ error: 'Término de búsqueda requerido' });
      }
      
      const resultados = await ModeloUnidadMedida.buscar(termino.trim());
      res.json(resultados);
    } catch (error) {
      console.error('Error buscando unidades:', error);
      res.status(500).json({ error: 'Error al buscar unidades de medida' });
    }
  }
};

export default ControladorUnidadMedida;