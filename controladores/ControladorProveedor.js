const ModeloProveedor = require('../modelos/ModeloProveedor');

const ControladorProveedor = {
  crearProveedor: (req, res) => {
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !identificacion) {
      return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
    }

    // Verificar si la identificación ya existe
    ModeloProveedor.verificarIdentificacionExistente(identificacion, null, (err, resultados) => {
      if (err) {
        console.error('Error verificando identificación:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Crear el proveedor
      ModeloProveedor.crear({
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      }, (err, resultados) => {
        if (err) {
          console.error('Error creando proveedor:', err);
          
          // Manejar error de duplicado de identificación
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La identificación ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al crear el proveedor' });
        }
        res.status(201).json({ 
          mensaje: 'Proveedor creado exitosamente', 
          id: resultados.insertId 
        });
      });
    });
  },

  obtenerProveedores: (req, res) => {
    ModeloProveedor.obtenerTodos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo proveedores:', err);
        return res.status(500).json({ error: 'Error al obtener proveedores' });
      }
      res.json(resultados);
    });
  },

  obtenerProveedor: (req, res) => {
    const id = req.params.id;
    
    ModeloProveedor.obtenerPorId(id, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo proveedor:', err);
        return res.status(500).json({ error: 'Error al obtener el proveedor' });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  actualizarProveedor: (req, res) => {
    const id = req.params.id;
    const { nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo } = req.body;
    
    // Validaciones básicas
    if (!nombres || !apellidos || !identificacion) {
      return res.status(400).json({ error: 'Nombre, apellido e identificación son obligatorios' });
    }

    // Verificar si la identificación ya existe (excluyendo el proveedor actual)
    ModeloProveedor.verificarIdentificacionExistente(identificacion, id, (err, resultados) => {
      if (err) {
        console.error('Error verificando identificación:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'La identificación ya existe' });
      }
      
      // Actualizar el proveedor
      ModeloProveedor.actualizar(id, {
        nombres, apellidos, identificacion, email, ciudad, direccion, celular, tipo
      }, (err, resultados) => {
        if (err) {
          console.error('Error actualizando proveedor:', err);
          
          // Manejar error de duplicado de identificación
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'La identificación ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al actualizar el proveedor' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
        }
        res.json({ mensaje: 'Proveedor actualizado exitosamente' });
      });
    });
  },

  eliminarProveedor: (req, res) => {
    const id = req.params.id;
    
    ModeloProveedor.eliminar(id, (err, resultados) => {
      if (err) {
        console.error('Error eliminando proveedor:', err);
        return res.status(500).json({ error: 'Error al eliminar el proveedor' });
      }
      if (resultados.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
      }
      res.json({ mensaje: 'Proveedor eliminado exitosamente' });
    });
  },

  buscarProveedores: (req, res) => {
    const { termino } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    ModeloProveedor.buscar(termino.trim(), (err, resultados) => {
      if (err) {
        console.error('Error buscando proveedores:', err);
        return res.status(500).json({ error: 'Error al buscar proveedores' });
      }
      res.json(resultados);
    });
  },

  obtenerProveedoresPorTipo: (req, res) => {
    const { tipo } = req.params;
    
    ModeloProveedor.obtenerPorTipo(tipo, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo proveedores por tipo:', err);
        return res.status(500).json({ error: 'Error al obtener proveedores por tipo' });
      }
      res.json(resultados);
    });
  },

  obtenerEstadisticas: (req, res) => {
    ModeloProveedor.obtenerEstadisticas((err, resultados) => {
      if (err) {
        console.error('Error obteniendo estadísticas:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados[0]);
    });
  },

  obtenerPorIdentificacion: (req, res) => {
    const { identificacion } = req.params;
    
    ModeloProveedor.obtenerPorIdentificacion(identificacion, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Proveedor no encontrado' });
      }
      res.json(resultados[0]);
    });
  }
};

module.exports = ControladorProveedor;