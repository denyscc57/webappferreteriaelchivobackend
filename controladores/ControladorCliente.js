const ModeloCliente = require('../modelos/ModeloCliente');

const ControladorCliente = {
  crearCliente: (req, res) => {
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !identificacion) {
      return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
    }

    // Verificar si la identificación ya existe
    ModeloCliente.verificarIdentificacionExistente(identificacion, null, (err, resultados) => {
      if (err) {
        console.error('Error verificando identificación:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Crear el cliente
      ModeloCliente.crear({
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      }, (err, resultados) => {
        if (err) {
          console.error('Error creando cliente:', err);
          
          // Manejar error de duplicado de identificación
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La identificación ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al crear el cliente' });
        }
        res.status(201).json({ 
          mensaje: 'Cliente creado exitosamente', 
          id: resultados.insertId 
        });
      });
    });
  },

  obtenerClientes: (req, res) => {
    ModeloCliente.obtenerTodos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo clientes:', err);
        return res.status(500).json({ error: 'Error al obtener clientes' });
      }
      res.json(resultados);
    });
  },

  obtenerCliente: (req, res) => {
    const id = req.params.id;
    
    ModeloCliente.obtenerPorId(id, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo cliente:', err);
        return res.status(500).json({ error: 'Error al obtener el cliente' });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  actualizarCliente: (req, res) => {
    const id = req.params.id;
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !identificacion) {
      return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
    }

    // Verificar si la identificación ya existe (excluyendo el cliente actual)
    ModeloCliente.verificarIdentificacionExistente(identificacion, id, (err, resultados) => {
      if (err) {
        console.error('Error verificando identificación:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Actualizar el cliente
      ModeloCliente.actualizar(id, {
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      }, (err, resultados) => {
        if (err) {
          console.error('Error actualizando cliente:', err);
          
          // Manejar error de duplicado de identificación
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La identificación ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al actualizar el cliente' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente actualizado exitosamente' });
      });
    });
  },

  eliminarCliente: (req, res) => {
    const id = req.params.id;
    
    ModeloCliente.eliminar(id, (err, resultados) => {
      if (err) {
        console.error('Error eliminando cliente:', err);
        return res.status(500).json({ error: 'Error al eliminar el cliente' });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
      }
      res.json({ mensaje: 'Cliente eliminado exitosamente' });
    });
  },

  buscarClientes: (req, res) => {
    const { termino } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    ModeloCliente.buscar(termino.trim(), (err, resultados) => {
      if (err) {
        console.error('Error buscando clientes:', err);
        return res.status(500).json({ error: 'Error al buscar clientes' });
      }
      res.json(resultados);
    });
  },

  obtenerClientesPorTipo: (req, res) => {
    const { tipo } = req.params;
    
    ModeloCliente.obtenerPorTipo(tipo, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo clientes por tipo:', err);
        return res.status(500).json({ error: 'Error al obtener clientes por tipo' });
      }
      res.json(resultados);
    });
  },

  obtenerEstadisticas: (req, res) => {
    ModeloCliente.obtenerEstadisticas((err, resultados) => {
      if (err) {
        console.error('Error obteniendo estadísticas:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados[0]);
    });
  },

  // ControladorCliente.js - Agregar este método
obtenerPorIdentificacion: (req, res) => {
  const { identificacion } = req.params;
  
  ModeloCliente.obtenerPorIdentificacion(identificacion, (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(resultados[0]);
  });
}
};

module.exports = ControladorCliente;