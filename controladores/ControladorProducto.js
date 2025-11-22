import ModeloProducto from '../modelos/ModeloProducto.js';

const ControladorProducto = {
  crearProducto: async (req, res) => {
    try {
      const { codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK } = req.body;
      
      // Validaciones básicas
      if (!codigo || !nombre || !categoria || !marca || !precio || !stock || !loteFK || !proveedorFK || !unidadmedidaFK) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes' });
      }

      // Verificar si el código ya existe
      const resultadosVerificacion = await ModeloProducto.verificarCodigoExistente(codigo, null);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      // Crear el producto
      const resultadoCreacion = await ModeloProducto.crear({
        codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK
      });
      
      res.status(201).json({ 
        mensaje: 'Producto creado exitosamente', 
        id: resultadoCreacion.insertId 
      });
    } catch (error) {
      console.error('Error creando producto:', error);
      
      // Manejar error de duplicado de código
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      res.status(500).json({ error: 'Error al crear el producto' });
    }
  },

  actualizarProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const { codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK } = req.body;
      
      // Validaciones básicas
      if (!codigo || !nombre || !categoria || !marca || !precio || !stock || !loteFK || !proveedorFK || !unidadmedidaFK) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes' });
      }

      // Verificar si el código ya existe (excluyendo el producto actual)
      const resultadosVerificacion = await ModeloProducto.verificarCodigoExistente(codigo, id);
      
      if (resultadosVerificacion[0].count > 0) {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      // Actualizar el producto
      const resultadoActualizacion = await ModeloProducto.actualizar(id, {
        codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK
      });
      
      if (resultadoActualizacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json({ mensaje: 'Producto actualizado exitosamente' });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      
      // Manejar error de duplicado de código
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  },

  obtenerProductos: async (req, res) => {
    try {
      const resultados = await ModeloProducto.obtenerTodos();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  obtenerProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloProducto.obtenerPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({ error: 'Error al obtener el producto' });
    }
  },

  eliminarProducto: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Primero verificar si el producto está en uso en ventas
      const ventasResult = await ModeloProducto.verificarUsoEnVentas(id);
      
      if (ventasResult[0].count > 0) {
        return res.status(400).json({ error: 'No se puede eliminar: el producto tiene ventas asociadas' });
      }
      
      // Verificar si el producto está en uso en inventario
      const inventarioResult = await ModeloProducto.verificarUsoEnInventario(id);
      
      if (inventarioResult[0].count > 0) {
        return res.status(400).json({ error: 'No se puede eliminar: el producto tiene movimientos de inventario' });
      }
      
      // Si no está en uso, proceder a eliminar
      const resultadosEliminacion = await ModeloProducto.eliminar(id);
      
      if (resultadosEliminacion.affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json({ mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  },

  buscarProductos: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino || termino.trim() === '') {
        return res.status(400).json({ error: 'Término de búsqueda requerido' });
      }
      
      const resultados = await ModeloProducto.buscar(termino.trim());
      res.json(resultados);
    } catch (error) {
      console.error('Error buscando productos:', error);
      res.status(500).json({ error: 'Error al buscar productos' });
    }
  },

  obtenerProductosPorCategoria: async (req, res) => {
    try {
      const { categoria } = req.params;
      const resultados = await ModeloProducto.obtenerPorCategoria(categoria);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoría' });
    }
  },

  // Nuevos métodos para verificación de uso
  verificarUsoEnVentas: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloProducto.verificarUsoEnVentas(id);
      res.json({ count: resultados[0].count });
    } catch (error) {
      console.error('Error verificando uso en ventas:', error);
      res.status(500).json({ error: 'Error al verificar uso en ventas' });
    }
  },

  verificarUsoEnInventario: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloProducto.verificarUsoEnInventario(id);
      res.json({ count: resultados[0].count });
    } catch (error) {
      console.error('Error verificando uso en inventario:', error);
      res.status(500).json({ error: 'Error al verificar uso en inventario' });
    }
  }
};

export default ControladorProducto;