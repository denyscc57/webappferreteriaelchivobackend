const db = require('../config/BaseDatos');

const ModeloProducto = {
 
  crear: (nuevoProducto, callback) => {
    const query = `
      INSERT INTO producto 
      (p_codigo, p_nombre, p_categoria, p_loteFK, p_marca, p_precio, p_stock, p_fecha_vencimiento, p_proveedorFK, p_unidadmedidaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [
      nuevoProducto.codigo,
      nuevoProducto.nombre,
      nuevoProducto.categoria,
      nuevoProducto.loteFK,
      nuevoProducto.marca,
      nuevoProducto.precio,
      nuevoProducto.stock,
      nuevoProducto.fecha_vencimiento,
      nuevoProducto.proveedorFK,
      nuevoProducto.unidadmedidaFK
    ], callback);
  },

 obtenerTodos: (callback) => {
  const query = `
    SELECT p.*, l.l_nombre as lote_nombre, 
           CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre,
           um.m_unidad as unidad_medida
    FROM producto p
    LEFT JOIN lote l ON p.p_loteFK = l.l_id
    LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
    LEFT JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
    ORDER BY p.p_codigo ASC
  `;
  db.query(query, callback);
},

  // Obtener producto por ID
  obtenerPorId: (id, callback) => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre,
             um.m_unidad as unidad_medida
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      LEFT JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      WHERE p.p_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Actualizar producto
  actualizar: (id, producto, callback) => {
    const query = `
      UPDATE producto 
      SET p_codigo=?, p_nombre=?, p_categoria=?, p_loteFK=?, p_marca=?, 
          p_precio=?, p_stock=?, p_fecha_vencimiento=?, p_proveedorFK=?, p_unidadmedidaFK=?
      WHERE p_id=?
    `;
    
    db.query(query, [
      producto.codigo,
      producto.nombre,
      producto.categoria,
      producto.loteFK,
      producto.marca,
      producto.precio,
      producto.stock,
      producto.fecha_vencimiento,
      producto.proveedorFK,
      producto.unidadmedidaFK,
      id
    ], callback);
  },
  // Obtener producto por código
  obtenerPorCodigo: (codigo, callback) => {
    const query = 'SELECT * FROM producto WHERE p_codigo = ?';
    db.query(query, [codigo], callback);
  },

  

  // Eliminar producto
  eliminar: (id, callback) => {
    const query = 'DELETE FROM producto WHERE p_id = ?';
    db.query(query, [id], callback);
  },

  // Verificar si código de producto ya existe
  verificarCodigoExistente: (codigo, excludeId = null, callback) => {
    let query = 'SELECT COUNT(*) as count FROM producto WHERE p_codigo = ?';
    let params = [codigo];
    
    if (excludeId) {
      query += ' AND p_id != ?';
      params.push(excludeId);
    }
    
    db.query(query, params, callback);
  },

  // Buscar productos por nombre o código
  buscar: (termino, callback) => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      WHERE (p.p_nombre LIKE ? OR p.p_codigo LIKE ?) 
      ORDER BY p.p_nombre
    `;
    const terminoBusqueda = `%${termino}%`;
    db.query(query, [terminoBusqueda, terminoBusqueda], callback);
  },

  // Obtener productos por categoría
  obtenerPorCategoria: (categoria, callback) => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      WHERE p.p_categoria = ? ORDER BY p.p_nombre
    `;
    db.query(query, [categoria], callback);
  },

  actualizarStock: (id, cantidad, callback) => {
    const query = 'UPDATE producto SET p_stock = p_stock + ? WHERE p_id = ?';
    db.query(query, [cantidad, id], callback);
  },

  // Verificar si el producto está en ventas
  verificarUsoEnVentas: (id, callback) => {
    const query = 'SELECT COUNT(*) as count FROM venta WHERE v_idproducto = ?';
    db.query(query, [id], callback);
  },

  // Verificar si el producto está en inventario
  verificarUsoEnInventario: (id, callback) => {
    const query = 'SELECT COUNT(*) as count FROM inventario WHERE i_idproductofk = ?';
    db.query(query, [id], callback);
  }
};

module.exports = ModeloProducto;