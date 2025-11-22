import ModeloVenta from '../modelos/ModeloVenta.js';
import ModeloProducto from '../modelos/ModeloProducto.js';
import ModeloCliente from '../modelos/ModeloCliente.js';
import ModeloCaja from '../modelos/ModeloCaja.js';

const ControladorVenta = {
  // Crear una nueva venta (con verificación de caja)
  crearVenta: async (req, res) => {
    try {
      console.log('=== INICIANDO CREACIÓN DE VENTA ===');
      console.log('Body recibido:', req.body);
      
      const { id_cliente, items, metodo_pago, cliente_info, id_usuario } = req.body;

      // Validar que tenemos el ID del usuario
      if (!id_usuario) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado en la solicitud' });
      }

      console.log('Usuario ID recibido:', id_usuario);

      // 1. VERIFICAR SI HAY CAJA ABIERTA PARA ESTE USUARIO
      const cajaAbierta = await ModeloCaja.obtenerUltimaCajaAbierta();
      
      if (cajaAbierta.length === 0) {
        return res.status(400).json({ 
          error: 'No se puede realizar la venta. No hay caja abierta en el sistema.' 
        });
      }

      const caja = cajaAbierta[0];
      console.log('Caja abierta encontrada:', caja);

      // Resto de validaciones
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'La venta debe contener items' });
      }

      if (!id_cliente && !cliente_info) {
        return res.status(400).json({ error: 'Debe seleccionar un cliente para realizar la venta' });
      }

      let cliente;
      
      // Si se proporciona info de cliente, usarla, sino buscar en BD
      if (cliente_info) {
        cliente = cliente_info;
      } else {
        const resultadosCliente = await ModeloCliente.obtenerPorId(id_cliente);
        cliente = resultadosCliente[0];
      }

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Calcular totales y verificar stock
      let subtotal = 0;
      const itemsActualizados = [];

      for (const item of items) {
        const resultadosProducto = await ModeloProducto.obtenerPorId(item.id_producto);
        const producto = resultadosProducto[0];

        if (!producto) {
          return res.status(404).json({ error: `Producto ${item.id_producto} no encontrado` });
        }

        if (producto.p_stock < item.cantidad) {
          return res.status(400).json({ 
            error: `Stock insuficiente para ${producto.p_nombre}`,
            stock_actual: producto.p_stock,
            stock_solicitado: item.cantidad
          });
        }

        // Usar precio actual del producto
        const precioActual = parseFloat(producto.p_precio);
        const totalItem = precioActual * item.cantidad;
        subtotal += totalItem;

        itemsActualizados.push({
          ...item,
          nombre: producto.p_nombre,
          marca: producto.p_marca,
          precio: precioActual,
          total: totalItem
        });
      }

      const impuestos = subtotal * 0.12;
      const total = subtotal + impuestos;

      // Generar número de factura
      const numeroFactura = await ModeloVenta.generarNumeroFactura();

      // Obtener fecha y hora actual
      const now = new Date();
      const fecha = now.toISOString().split('T')[0];
      const hora = now.toTimeString().split(' ')[0];

      // Insertar cada item como venta individual (incluyendo el ca_id)
      for (const item of itemsActualizados) {
        const ventaData = {
          factura: numeroFactura,
          nombre: item.nombre,
          marca: item.marca,
          precio: item.precio,
          cantidad: item.cantidad,
          total: item.total,
          id_cliente: cliente.c_id || id_cliente,
          id_usuario: id_usuario,
          identificacion: cliente.c_identificacion || cliente_info.identificacion,
          nombresapellidos: `${cliente.c_nombres || cliente_info.nombres} ${cliente.c_apellidos || cliente_info.apellidos}`,
          ciudad: cliente.c_ciudad || cliente_info.ciudad || '',
          direccion: cliente.c_direccion || cliente_info.direccion || '',
          celular: cliente.c_celular || cliente_info.celular || '',
          fecha: fecha,
          hora: hora,
          id_caja: caja.ca_id
        };

        console.log('Datos de venta a insertar (con caja):', ventaData);

        await ModeloVenta.agregarDetalleVenta(ventaData);

        // Insertar en inventario
        const inventarioData = {
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          id_usuario: id_usuario,
          estado: 2,
          fecha: fecha,
          hora: hora
        };

        await ModeloVenta.agregarInventario(inventarioData);

        // Actualizar stock del producto
        await ModeloProducto.actualizarStock(item.id_producto, -item.cantidad);
      }

      res.status(201).json({
        mensaje: 'Venta registrada exitosamente',
        factura: numeroFactura,
        total: total,
        id_caja: caja.ca_id,
        facturaFEL: ControladorVenta.generarFacturaFEL(numeroFactura, itemsActualizados, cliente, total, fecha, hora)
      });

    } catch (error) {
      console.error('Error en crearVenta:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Generar factura FEL simulada
  generarFacturaFEL: (numeroFactura, items, cliente, total, fecha, hora) => {
    const subtotal = total / 1.12;
    const impuestos = total - subtotal;
    
    return {
      serie: 'F',
      numero: numeroFactura,
      fecha: `${fecha}T${hora}`,
      nombre_emisor: 'FERRETERÍA EL CHIVO',
      nit_emisor: '123456789',
      direccion_emisor: 'Calle Principal, Ciudad',
      nombre_receptor: cliente ? `${cliente.c_nombres || cliente.nombres} ${cliente.c_apellidos || cliente.apellidos}` : 'CONSUMIDOR FINAL',
      nit_receptor: cliente ? (cliente.c_identificacion || cliente.identificacion) : 'CF',
      direccion_receptor: cliente ? (cliente.c_direccion || cliente.direccion) : 'CIUDAD',
      items: items.map(item => ({
        cantidad: item.cantidad,
        descripcion: item.nombre,
        precio_unitario: item.precio,
        total: item.total
      })),
      subtotal: subtotal,
      impuestos: impuestos,
      total: total,
      metodo_pago: 'efectivo',
      numero_autorizacion: `A${Date.now()}`,
      serie_fel: 'FELGT',
      estado: 'RECIBIDA',
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FEL${numeroFactura}`
    };
  },

  // Obtener venta por ID
  obtenerVenta: async (req, res) => {
    try {
      const id = req.params.id;
      const resultadosVenta = await ModeloVenta.obtenerPorId(id);
      
      if (resultadosVenta.length === 0) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      const venta = resultadosVenta[0];
      res.json({
        venta: venta,
        items: resultadosVenta
      });
    } catch (error) {
      console.error('Error obteniendo venta:', error);
      res.status(500).json({ error: 'Error al obtener la venta' });
    }
  },

  // Obtener todas las ventas
  obtenerVentas: async (req, res) => {
    try {
      const { fecha_inicio, fecha_fin, vendedor } = req.query;
      const filtros = {};

      if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
      if (fecha_fin) filtros.fecha_fin = fecha_fin;
      if (vendedor) filtros.vendedor = vendedor;

      const resultados = await ModeloVenta.obtenerTodas(filtros);
      
      // Agrupar por número de factura
      const ventasAgrupadas = {};
      resultados.forEach(venta => {
        if (!ventasAgrupadas[venta.v_factura]) {
          ventasAgrupadas[venta.v_factura] = {
            factura: venta.v_factura,
            cliente: `${venta.c_nombres} ${venta.c_apellidos}`,
            fecha: venta.v_fecha,
            total: 0,
            items: []
          };
        }
        ventasAgrupadas[venta.v_factura].total += parseFloat(venta.v_total);
        ventasAgrupadas[venta.v_factura].items.push(venta);
      });

      res.json(Object.values(ventasAgrupadas));
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      res.status(500).json({ error: 'Error al obtener las ventas' });
    }
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloVenta.obtenerEstadisticas();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
};

export default ControladorVenta;