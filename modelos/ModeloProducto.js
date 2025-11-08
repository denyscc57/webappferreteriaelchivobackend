const db = require('../config/DBAdapter');

const ModeloProductoPromises = {
  crear: (nuevoProducto) => {
    const query = `
      INSERT INTO producto 
      (p_codigo, p_nombre, p_categoria, p_loteFK, p_marca, p_precio, p_stock, p_fecha_vencimiento, p_proveedorFK, p_unidadmedidaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.execute(query, [
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
    ]);
  },

  obtenerTodos: () => {
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
    return db.execute(query);
  },

  obtenerPorId: (id) => {
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
    return db.execute(query, [id]);
  },

  actualizar: (id, producto) => {
    const query = `
      UPDATE producto 
      SET p_codigo=?, p_nombre=?, p_categoria=?, p_loteFK=?, p_marca=?, 
          p_precio=?, p_stock=?, p_fecha_vencimiento=?, p_proveedorFK=?, p_unidadmedidaFK=?
      WHERE p_id=?
    `;
    
    return db.execute(query, [
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
    ]);
  },

  obtenerPorCodigo: (codigo) => {
    const query = 'SELECT * FROM producto WHERE p_codigo = ?';
    return db.execute(query, [codigo]);
  },

  eliminar: (id) => {
    const query = 'DELETE FROM producto WHERE p_id = ?';
    return db.execute(query, [id]);
  },

  verificarCodigoExistente: (codigo, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM producto WHERE p_codigo = ?';
    let params = [codigo];
    
    if (excludeId) {
      query += ' AND p_id != ?';
      params.push(excludeId);
    }
    
    return db.execute(query, params);
  },

  buscar: (termino) => {
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
    return db.execute(query, [terminoBusqueda, terminoBusqueda]);
  },

  obtenerPorCategoria: (categoria) => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      WHERE p.p_categoria = ? ORDER BY p.p_nombre
    `;
    return db.execute(query, [categoria]);
  },

  actualizarStock: (id, cantidad) => {
    const query = 'UPDATE producto SET p_stock = p_stock + ? WHERE p_id = ?';
    return db.execute(query, [cantidad, id]);
  },

  verificarUsoEnVentas: (id) => {
    const query = 'SELECT COUNT(*) as count FROM venta WHERE v_idproducto = ?';
    return db.execute(query, [id]);
  },

  verificarUsoEnInventario: (id) => {
    const query = 'SELECT COUNT(*) as count FROM inventario WHERE i_idproductofk = ?';
    return db.execute(query, [id]);
  }
};

module.exports = ModeloProductoPromises;