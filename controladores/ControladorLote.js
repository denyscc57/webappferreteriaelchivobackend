import ModeloLote from '../modelos/ModeloLote.js';
import { pool } from '../config/BaseDatos.js';

const ControladorLote = {
  crearLote: async (req, res) => {
    try {
      const { codigo, nombre, descripcion } = req.body;
      
      // Validaciones básicas
      if (!codigo || !nombre) {
        return res.status(400).json({ error: 'Código y nombre son obligatorios' });
      }

      // Verificar si el código ya existe
      const resultadosVerificacion = await ModeloLote.verificarCodigoExistente(codigo, null);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      // Crear el lote
      const resultadoCreacion = await ModeloLote.crear({
        codigo, nombre, descripcion
      });
      
      res.status(201).json({ 
        mensaje: 'Lote creado exitosamente', 
        id: resultadoCreacion.insertId 
      });
    } catch (error) {
      console.error('Error creando lote:', error);
      
      // Manejar error de duplicado de código
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      res.status(500).json({ error: 'Error al crear el lote' });
    }
  },

  obtenerLotes: async (req, res) => {
    try {
      const resultados = await ModeloLote.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo lotes:', error);
      res.status(500).json({ error: 'Error al obtener lotes' });
    }
  },

  obtenerLote: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloLote.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Lote no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo lote:', error);
      res.status(500).json({ error: 'Error al obtener el lote' });
    }
  },

  actualizarLote: async (req, res) => {
    try {
      const id = req.params.id;
      const { codigo, nombre, descripcion } = req.body;
      
      // Validaciones básicas
      if (!codigo || !nombre) {
        return res.status(400).json({ error: 'Código y nombre son obligatorios' });
      }

      // Verificar si el código ya existe (excluyendo el lote actual)
      const resultadosVerificacion = await ModeloLote.verificarCodigoExistente(codigo, id);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      // Actualizar el lote
      const resultadoActualizacion = await ModeloLote.actualizar(id, {
        codigo, nombre, descripcion
      });
      
      if (resultadoActualizacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Lote no encontrado' });
      }
      res.json({ mensaje: 'Lote actualizado exitosamente' });
    } catch (error) {
      console.error('Error actualizando lote:', error);
      
      // Manejar error de duplicado de código
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El código ya existe' });
      }
      
      res.status(500).json({ error: 'Error al actualizar el lote' });
    }
  },

  eliminarLote: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Primero verificar si el lote tiene productos asociados
      const resultadosVerificacion = await ModeloLote.verificarProductosAsociados(id);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el lote porque tiene productos asociados' 
        });
      }
      
      // Si no tiene productos, proceder a eliminar
      const resultadosEliminacion = await ModeloLote.eliminar(id);
      
      if (resultadosEliminacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Lote no encontrado' });
      }
      res.json({ mensaje: 'Lote eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando lote:', error);
      res.status(500).json({ error: 'Error al eliminar el lote' });
    }
  },

  buscarLotes: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino || termino.trim() === '') {
        return res.status(400).json({ error: 'Término de búsqueda requerido' });
      }
      
      const resultados = await ModeloLote.buscar(termino.trim());
      res.json(resultados);
    } catch (error) {
      console.error('Error buscando lotes:', error);
      res.status(500).json({ error: 'Error al buscar lotes' });
    }
  },

  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloLote.obtenerEstadisticas();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  obtenerLotesConProductos: async (req, res) => {
    try {
      const resultados = await ModeloLote.obtenerLotesConProductos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo lotes con productos:', error);
      res.status(500).json({ error: 'Error al obtener lotes con productos' });
    }
  },

  obtenerPorCodigo: async (req, res) => {
    try {
      const { codigo } = req.params;
      const resultados = await ModeloLote.obtenerPorCodigo(codigo);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Lote no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo lote por código:', error);
      res.status(500).json({ error: 'Error al obtener el lote' });
    }
  },

  // Obtener productos por lote
  obtenerProductosPorLote: async (req, res) => {
    try {
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
      
      const [resultados] = await pool.query(query, [loteId]);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos por lote:', error);
      res.status(500).json({ error: 'Error al obtener productos del lote' });
    }
  }
};

export default ControladorLote;