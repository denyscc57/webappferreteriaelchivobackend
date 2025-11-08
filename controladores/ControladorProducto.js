const ModeloProducto = require('../modelos/ModeloProducto');

const ControladorProducto = {
 
   crearProducto: (req, res) => {
    const { codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK } = req.body;
    
    // Validaciones básicas
    if (!codigo || !nombre || !categoria || !marca || !precio || !stock || !loteFK || !proveedorFK || !unidadmedidaFK) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }

    // Verificar si el código ya existe
    ModeloProducto.verificarCodigoExistente(codigo, null, (err, resultados) => {
      if (err) {
        console.error('Error verificando código:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      // Crear el producto
      ModeloProducto.crear({
        codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK
      }, (err, resultados) => {
        if (err) {
          console.error('Error creando producto:', err);
          
          // Manejar error de duplicado de código
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El código de producto ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al crear el producto' });
        }
        res.status(201).json({ 
          mensaje: 'Producto creado exitosamente', 
          id: resultados.insertId 
        });
      });
    });
  },

  actualizarProducto: (req, res) => {
    const id = req.params.id;
    const { codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK } = req.body;
    
    // Validaciones básicas
    if (!codigo || !nombre || !categoria || !marca || !precio || !stock || !loteFK || !proveedorFK || !unidadmedidaFK) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }

    // Verificar si el código ya existe (excluyendo el producto actual)
    ModeloProducto.verificarCodigoExistente(codigo, id, (err, resultados) => {
      if (err) {
        console.error('Error verificando código:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (resultados[0].count > 0) {
        return res.status(400).json({ error: 'El código de producto ya existe' });
      }
      
      // Actualizar el producto
      ModeloProducto.actualizar(id, {
        codigo, nombre, categoria, loteFK, marca, precio, stock, fecha_vencimiento, proveedorFK, unidadmedidaFK
      }, (err, resultados) => {
        if (err) {
          console.error('Error actualizando producto:', err);
          
          // Manejar error de duplicado de código
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El código de producto ya existe' });
          }
          
          return res.status(500).json({ error: 'Error al actualizar el producto' });
        }
        if (resultados.affectedRows === 0) {
          return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto actualizado exitosamente' });
      });
    });
  },

  obtenerProductos: (req, res) => {
    ModeloProducto.obtenerTodos((err, resultados) => {
      if (err) {
        console.error('Error obteniendo productos:', err);
        return res.status(500).json({ error: 'Error al obtener productos' });
      }
      res.json(resultados);
    });
  },

  obtenerProducto: (req, res) => {
    const id = req.params.id;
    
    ModeloProducto.obtenerPorId(id, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo producto:', err);
        return res.status(500).json({ error: 'Error al obtener el producto' });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

 
  eliminarProducto: (req, res) => {
    const id = req.params.id;
    
    // Primero verificar si el producto está en uso en ventas
    ModeloProducto.verificarUsoEnVentas(id, (err, ventasResult) => {
      if (err) {
        console.error('Error verificando ventas:', err);
        return res.status(500).json({ error: 'Error al verificar uso en ventas' });
      }
      
      if (ventasResult[0].count > 0) {
        return res.status(400).json({ error: 'No se puede eliminar: el producto tiene ventas asociadas' });
      }
      
      // Verificar si el producto está en uso en inventario
      ModeloProducto.verificarUsoEnInventario(id, (err, inventarioResult) => {
        if (err) {
          console.error('Error verificando inventario:', err);
          return res.status(500).json({ error: 'Error al verificar uso en inventario' });
        }
        
        if (inventarioResult[0].count > 0) {
          return res.status(400).json({ error: 'No se puede eliminar: el producto tiene movimientos de inventario' });
        }
        
        // Si no está en uso, proceder a eliminar
        ModeloProducto.eliminar(id, (err, resultados) => {
          if (err) {
            console.error('Error eliminando producto:', err);
            return res.status(500).json({ error: 'Error al eliminar el producto' });
          }
          if (resultados.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
          }
          res.json({ mensaje: 'Producto eliminado exitosamente' });
        });
      });
    });
  },

  buscarProductos: (req, res) => {
    const { termino } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }
    
    ModeloProducto.buscar(termino.trim(), (err, resultados) => {
      if (err) {
        console.error('Error buscando productos:', err);
        return res.status(500).json({ error: 'Error al buscar productos' });
      }
      res.json(resultados);
    });
  },

  obtenerProductosPorCategoria: (req, res) => {
    const { categoria } = req.params;
    
    ModeloProducto.obtenerPorCategoria(categoria, (err, resultados) => {
      if (err) {
        console.error('Error obteniendo productos por categoría:', err);
        return res.status(500).json({ error: 'Error al obtener productos por categoría' });
      }
      res.json(resultados);
    });
  },

  // Nuevos métodos para verificación de uso
  verificarUsoEnVentas: (req, res) => {
    const id = req.params.id;
    
    ModeloProducto.verificarUsoEnVentas(id, (err, resultados) => {
      if (err) {
        console.error('Error verificando uso en ventas:', err);
        return res.status(500).json({ error: 'Error al verificar uso en ventas' });
      }
      res.json({ count: resultados[0].count });
    });
  },

  verificarUsoEnInventario: (req, res) => {
    const id = req.params.id;
    
    ModeloProducto.verificarUsoEnInventario(id, (err, resultados) => {
      if (err) {
        console.error('Error verificando uso en inventario:', err);
        return res.status(500).json({ error: 'Error al verificar uso en inventario' });
      }
      res.json({ count: resultados[0].count });
    });
  }
};

module.exports = ControladorProducto;