import { pool } from '../config/BaseDatos.js';

const ModeloVenta = {
  // Crear una nueva venta (adaptado a tu estructura de BD)
  crear: async (nuevaVenta) => {
    const query = `
      INSERT INTO venta 
      (v_factura, v_fkidcliente, v_fkidusuario, v_identificacion, v_nombresapellidos, 
       v_ciudad, v_direccion, v_celular, v_fecha, v_hora, v_cajaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      nuevaVenta.factura,
      nuevaVenta.id_cliente,
      nuevaVenta.id_usuario,
      nuevaVenta.identificacion,
      nuevaVenta.nombresapellidos,
      nuevaVenta.ciudad,
      nuevaVenta.direccion,
      nuevaVenta.celular,
      nuevaVenta.fecha,
      nuevaVenta.hora,
      nuevaVenta.id_caja
    ]);
    return resultados;
  },

  // Agregar detalle de venta (actualizado con campo de caja)
  agregarDetalleVenta: async (detalle) => {
    const query = `
      INSERT INTO venta 
      (v_factura, v_nombre, v_marca, v_precio, v_cantidad, v_total, 
       v_fkidcliente, v_fkidusuario, v_identificacion, v_nombresapellidos, 
       v_ciudad, v_direccion, v_celular, v_fecha, v_hora, v_cajaFK) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      detalle.factura,
      detalle.nombre,
      detalle.marca,
      detalle.precio,
      detalle.cantidad,
      detalle.total,
      detalle.id_cliente,
      detalle.id_usuario,
      detalle.identificacion,
      detalle.nombresapellidos,
      detalle.ciudad,
      detalle.direccion,
      detalle.celular,
      detalle.fecha,
      detalle.hora,
      detalle.id_caja
    ]);
    return resultados;
  },

  // Agregar registro de inventario (CORREGIDO)
  agregarInventario: async (inventario) => {
    const query = `
      INSERT INTO inventario 
      (i_idproductofk, i_tipo_movimiento, i_cantidad, i_idusuariofk, i_motivo, i_fecha, i_hora) 
      VALUES (?, 'salida', ?, ?, ?, ?, ?)
    `;
    
    const [resultados] = await pool.query(query, [
      inventario.id_producto,
      inventario.cantidad,
      inventario.id_usuario,
      'Venta',
      inventario.fecha,
      inventario.hora
    ]);
    return resultados;
  },

  // Obtener venta por ID
  obtenerPorId: async (id) => {
    const query = `
      SELECT v.*, c.c_nombres, c.c_apellidos, c.c_identificacion, c.c_email, c.c_direccion,
             u.u_nombres as vendedor_nombres, u.u_apellidos as vendedor_apellidos
      FROM venta v
      LEFT JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE v.v_id = ?
    `;
    
    const [resultados] = await pool.query(query, [id]);
    return resultados;
  },

  // Obtener todas las ventas
  obtenerTodas: async (filtros = {}) => {
    let query = `
      SELECT v.*, c.c_nombres, c.c_apellidos, u.u_nombres as vendedor_nombres
      FROM venta v
      LEFT JOIN cliente c ON v.v_fkidcliente = c.c_id
      INNER JOIN usuario u ON v.v_fkidusuario = u.u_id
      WHERE 1=1
    `;
    let params = [];

    if (filtros.fecha_inicio && filtros.fecha_fin) {
      query += ' AND v.v_fecha BETWEEN ? AND ?';
      params.push(filtros.fecha_inicio, filtros.fecha_fin);
    }

    if (filtros.vendedor) {
      query += ' AND v.v_fkidusuario = ?';
      params.push(filtros.vendedor);
    }

    query += ' ORDER BY v.v_fecha DESC, v.v_hora DESC';

    const [resultados] = await pool.query(query, params);
    return resultados;
  },

  // Generar número de factura único
  generarNumeroFactura: async () => {
    const prefix = 'F';
    const year = new Date().getFullYear();
    const query = 'SELECT COUNT(*) as total FROM venta WHERE v_factura LIKE ?';
    const likePattern = `${prefix}${year}%`;
    
    const [resultados] = await pool.query(query, [likePattern]);
    const nextNumber = resultados[0].total + 1;
    const factura = `${prefix}${year}${nextNumber.toString().padStart(8, '0')}`;
    return factura;
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: async () => {
    const query = `
      SELECT 
        COUNT(*) as total_ventas,
        SUM(v_total) as total_ingresos,
        AVG(v_total) as promedio_venta,
        MIN(v_fecha) as fecha_primer_venta,
        MAX(v_fecha) as fecha_ultima_venta,
        COUNT(DISTINCT v_fkidcliente) as clientes_unicos
      FROM venta
    `;
    
    const [resultados] = await pool.query(query);
    return resultados;
  }
};

export default ModeloVenta;