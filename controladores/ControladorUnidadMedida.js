const ModeloUnidadMedida = require('../modelos/ModeloUnidadMedida');

const ControladorUnidadMedida = {
  crearUnidad: (req, res) => {
    const { unidad } = req.body;
    
    // Validaciones básicas
    if (!unidad || unidad.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la unidad es obligatorio' });
    }

    // Verificar si la unidad ya existe
    ModeloUnidadMedida.verificarUnidadExistente(unidad.trim(), null, (err, resultados) => {
      if (err) {
        console.error('Error verificando unidad:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      // Crear la unidad
      ModeloUnidadMedida.crear({ unidad: unidad.trim() }, (err, resultados) => {
        if (err) {
          console.error('Error creando unidad:', err);
          
          // Manejar error de duplicado
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La unidad de medida ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al crear la unidad de medida' });
        }
        res.status(201).json({ 
          mensaje: 'Unidad de medida creada exitosamente', 
          id: resultados.insertId 
        });
      });
    });
  },

  obtenerUnidades: (req, res) => {
    ModeloUnidadMedida.obtenerTodos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo unidades:', err);
        return res.status(500).json({ error: 'Error al obtener unidades de medida' });
      }
      res.json(resultados);
    });
  },

  obtenerUnidad: (req, res) => {
    const id = req.params.id;
    
    ModeloUnidadMedida.obtenerPorId(id, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo unidad:', err);
        return res.status(500).json({ error: 'Error al obtener la unidad de medida' });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
      }
      res.json(resultados[0]);
    });
  },

  actualizarUnidad: (req, res) => {
    const id = req.params.id;
    const { unidad } = req.body;
    
    // Validaciones básicas
    if (!unidad || unidad.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la unidad es obligatorio' });
    }

    // Verificar si la unidad ya existe (excluyendo la unidad actual)
    ModeloUnidadMedida.verificarUnidadExistente(unidad.trim(), id, (err, resultados) => {
      if (err) {
        console.error('Error verificando unidad:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La unidad de medida ya existe' });
      }
      
      // Actualizar la unidad
      ModeloUnidadMedida.actualizar(id, { unidad: unidad.trim() }, (err, resultados) => {
        if (err) {
          console.error('Error actualizando unidad:', err);
          
          // Manejar error de duplicado
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La unidad de medida ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al actualizar la unidad de medida' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
        }
        res.json({ mensaje: 'Unidad de medida actualizada exitosamente' });
      });
    });
  },

  eliminarUnidad: (req, res) => {
    const id = req.params.id;
    
    ModeloUnidadMedida.eliminar(id, (err, resultados) => {
      if (err) {
        console.error('Error eliminando unidad:', err);
        
        if (err.message.includes('No se puede eliminar')) {
          return res.status(400).json({ error: err.message });
        }
        
        return res.status(500).json({ error: 'Error al eliminar la unidad de medida' });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Unidad de medida no encontrada' });
      }
      res.json({ mensaje: 'Unidad de medida eliminada exitosamente' });
    });
  },

  buscarUnidades: (req, res) => {
    const { termino } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    ModeloUnidadMedida.buscar(termino.trim(), (err, resultados) => {
      if (err) {
        console.error('Error buscando unidades:', err);
        return res.status(500).json({ error: 'Error al buscar unidades de medida' });
      }
      res.json(resultados);
    });
  }
};

module.exports = ControladorUnidadMedida;