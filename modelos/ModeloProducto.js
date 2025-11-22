import { pool } from '../config/BaseDatos.js';

const ModeloProducto = {
  // Crear producto
  crear: async (nuevoProducto) => {
    const query = `
      INSERT INTO producto 
      (p_codigo, p_nombre, p_categoria, p_loteFK, p_marca, p_precio, p_stock, p_fecha_vencimiento, p_proveedorFK, p_unidadmedidaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
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
    return resultados;
  },

  // Obtener todos los productos
  obtenerTodos: async () => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre,
             um.m_unidad as unidad_medida
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      LEFT JOIN unidadmedida um ON p.p_unidadmedidaFK = um.m_id
      ORDER BY p.p_nombre
    `;
    const [resultados] = await pool.query(query);
    return resultados;
  },

  // Obtener producto por ID
  obtenerPorId: async (id) => {
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
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Actualizar producto
  actualizar: async (id, producto) => {
    const query = `
      UPDATE producto 
      SET p_codigo=?, p_nombre=?, p_categoria=?, p_loteFK=?, p_marca=?, 
          p_precio=?, p_stock=?, p_fecha_vencimiento=?, p_proveedorFK=?, p_unidadmedidaFK=?
      WHERE p_id=?
    `;
    
    const [resultados] = await pool.query(query, [
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
    return resultados;
  },

  // Obtener producto por código
  obtenerPorCodigo: async (codigo) => {
    const query = 'SELECT * FROM producto WHERE p_codigo = ?';
    const [resultados] = await pool.query(query, [codigo]);
    return resultados;
  },

  // Eliminar producto
  eliminar: async (id) => {
    const query = 'DELETE FROM producto WHERE p_id = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si código de producto ya existe
  verificarCodigoExistente: async (codigo, excludeId = null) => {
    let query = 'SELECT COUNT(*) as count FROM producto WHERE p_codigo = ?';
    let params = [codigo];
    
    if (excludeId) {
      query += ' AND p_id != ?';
      params.push(excludeId);
    }
    
    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Buscar productos por nombre o código
  buscar: async (termino) => {
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
    const [resultados] = await pool.query(query, [terminoBusqueda, terminoBusqueda]);
    return resultados;
  },

  // Obtener productos por categoría
  obtenerPorCategoria: async (categoria) => {
    const query = `
      SELECT p.*, l.l_nombre as lote_nombre, 
             CONCAT(pr.pr_nombres, ' ', pr.pr_apellidos) as proveedor_nombre
      FROM producto p
      LEFT JOIN lote l ON p.p_loteFK = l.l_id
      LEFT JOIN proveedor pr ON p.p_proveedorFK = pr.pr_id
      WHERE p.p_categoria = ? ORDER BY p.p_nombre
    `;
    const [resultados] = await pool.query(query, [categoria]);
    return resultados;
  },

  // Actualizar stock
  actualizarStock: async (id, cantidad) => {
    const query = 'UPDATE producto SET p_stock = p_stock + ? WHERE p_id = ?';
    const [resultados] = await pool.query(query, [cantidad, id]);
    return resultados;
  },

  // Verificar si el producto está en ventas
  verificarUsoEnVentas: async (id) => {
    const query = 'SELECT COUNT(*) as count FROM venta WHERE v_idproducto = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Verificar si el producto está en inventario
  verificarUsoEnInventario: async (id) => {
    const query = 'SELECT COUNT(*) as count FROM inventario WHERE i_idproductofk = ?';
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  }
};

export default ModeloProducto;