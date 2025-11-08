const ModeloLote = require('../modelos/ModeloLote');
const db = require('../config/BaseDatos'); // Agrega esta importación

const ControladorLote = {
  crearLote: (req, res) => {
    const { codigo, nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'Código y nombre son obligatorios' });
    }

    // Verificar si el código ya existe
    ModeloLote.verificarCodigoExistente(codigo, null, (err, resultados) => {
      if (err) {
        console.error('Error verificando código:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      // Crear el lote
      ModeloLote.crear({
        codigo, nombre, descripcion
      }, (err, resultados) => {
        if (err) {
          console.error('Error creando lote:', err);
          
          // Manejar error de duplicado de código
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El código ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al crear el lote' });
        }
        res.status(201).json({ 
          mensaje: 'Lote creado exitosamente', 
          id: resultados.insertId 
        });
      });
    });
  },

  obtenerLotes: (req, res) => {
    ModeloLote.obtenerTodos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo lotes:', err);
        return res.status(500).json({ error: 'Error al obtener lotes' });
      }
      res.json(resultados);
    });
  },

  obtenerLote: (req, res) => {
    const id = req.params.id;
    
    ModeloLote.obtenerPorId(id, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo lote:', err);
        return res.status(500).json({ error: 'Error al obtener el lote' });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Lote no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  actualizarLote: (req, res) => {
    const id = req.params.id;
    const { codigo, nombre, descripcion } = req.body;
    
    // Validaciones básicas
    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'Código y nombre son obligatorios' });
    }

    // Verificar si el código ya existe (excluyendo el lote actual)
    ModeloLote.verificarCodigoExistente(codigo, id, (err, resultados) => {
      if (err) {
        console.error('Error verificando código:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      // Actualizar el lote
      ModeloLote.actualizar(id, {
        codigo, nombre, descripcion
      }, (err, resultados) => {
        if (err) {
          console.error('Error actualizando lote:', err);
          
          // Manejar error de duplicado de código
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El código ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al actualizar el lote' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Lote no encontrado' });
        }
        res.json({ mensaje: 'Lote actualizado exitosamente' });
      });
    });
  },

  eliminarLote: (req, res) => {
    const id = req.params.id;
    
    // Primero verificar si el lote tiene productos asociados
    ModeloLote.verificarProductosAsociados(id, (err, resultados) => {
      if (err) {
        console.error('Error verificando productos:', err);
        return res.status(500).json({ error: 'Error al verificar productos asociados' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el lote porque tiene productos asociados' 
        });
      }
      
      // Si no tiene productos, proceder a eliminar
      ModeloLote.eliminar(id, (err, resultados) => {
        if (err) {
          console.error('Error eliminando lote:', err);
          return res.status(500).json({ error: 'Error al eliminar el lote' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Lote no encontrado' });
        }
        res.json({ mensaje: 'Lote eliminado exitosamente' });
      });
    });
  },

  buscarLotes: (req, res) => {
    const { termino } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    ModeloLote.buscar(termino.trim(), (err, resultados) => {
      if (err) {
        console.error('Error buscando lotes:', err);
        return res.status(500).json({ error: 'Error al buscar lotes' });
      }
      res.json(resultados);
    });
  },

  obtenerEstadisticas: (req, res) => {
    ModeloLote.obtenerEstadisticas((err, resultados) => {
      if (err) {
        console.error('Error obteniendo estadísticas:', err);
        return res.status(500).json({ error: 'Error al obtener estadísticas' });
      }
      res.json(resultados);
    });
  },

  obtenerLotesConProductos: (req, res) => {
    ModeloLote.obtenerLotesConProductos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo lotes con productos:', err);
        return res.status(500).json({ error: 'Error al obtener lotes con productos' });
      }
      res.json(resultados);
    });
  },

  obtenerPorCodigo: (req, res) => {
    const { codigo } = req.params;
    
    ModeloLote.obtenerPorCodigo(codigo, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Lote no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  // Obtener productos por lote
  obtenerProductosPorLote: (req, res) => {
    const loteId = req.params.id;
    
    const query = `
      SELECT p.*, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre,
             um.m_unidad as unidad_medida
      FROM producto p
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      LEFT JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      WHERE p.p_loteFK = ?
      ORDER BY p.p_nombre
    `;
    
    db.query(query, [loteId], (err, resultados) => {
      if (err) {
        console.error('Error obteniendo productos por lote:', err);
        return res.status(500).json({ error: 'Error al obtener productos del lote' });
      }
      res.json(resultados);
    });
  }
};

module.exports = ControladorLote;