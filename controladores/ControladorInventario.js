import ModeloInventario from '../modelos/ModeloInventario.js';
import ModeloProducto from '../modelos/ModeloProducto.js';

const ControladorInventario = {
  // Registrar movimiento de inventario
  registrarMovimiento: async (req, res) => {
    try {
      const { id_producto, tipo_movimiento, cantidad, motivo, fecha, hora } = req.body;
      const id_usuario = req.userId;

      // Validaciones
      if (!id_producto || !tipo_movimiento || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
      }

      if (!['entrada', 'salida'].includes(tipo_movimiento)) {
        return res.status(400).json({ error: 'Tipo de movimiento inválido' });
      }

      // Verificar que el producto existe
      const resultadosProducto = await ModeloProducto.obtenerPorId(id_producto);
      
      if (resultadosProducto.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const producto = resultadosProducto[0];

      // Para salidas, verificar que haya stock suficiente
      if (tipo_movimiento === 'salida' && producto.p_stock < cantidad) {
        return res.status(400).json({ 
          error: 'Stock insuficiente', 
          stock_actual: producto.p_stock,
          stock_solicitado: cantidad 
        });
      }

      // Registrar el movimiento
      const movimiento = {
        id_producto,
        tipo_movimiento,
        cantidad,
        motivo: motivo || 'Movimiento manual',
        id_usuario,
        fecha: fecha || new Date().toISOString().split('T')[0],
        hora: hora || new Date().toTimeString().split(' ')[0]
      };

      const resultadosMovimiento = await ModeloInventario.registrarMovimiento(movimiento);

      // Actualizar el stock del producto
      const nuevoStock = tipo_movimiento === 'entrada' 
        ? producto.p_stock + cantidad 
        : producto.p_stock - cantidad;

      await ModeloProducto.actualizarStock(id_producto, 
        tipo_movimiento === 'entrada' ? cantidad : -cantidad
      );

      res.status(201).json({
        mensaje: `Movimiento de ${tipo_movimiento} registrado exitosamente`,
        id_movimiento: resultadosMovimiento.insertId,
        stock_anterior: producto.p_stock,
        stock_nuevo: nuevoStock,
        movimiento: movimiento
      });

    } catch (error) {
      console.error('Error registrando movimiento:', error);
      res.status(500).json({ error: 'Error al registrar movimiento' });
    }
  },

  // Obtener todos los movimientos
  obtenerMovimientos: async (req, res) => {
    try {
      const { producto, tipo, fecha_inicio, fecha_fin } = req.query;
      const filtros = {};

      if (producto) filtros.producto = producto;
      if (tipo) filtros.tipo = tipo;
      if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
      if (fecha_fin) filtros.fecha_fin = fecha_fin;

      const resultados = await ModeloInventario.obtenerMovimientos(filtros);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      res.status(500).json({ error: 'Error al obtener movimientos' });
    }
  },

  // Obtener movimiento por ID
  obtenerMovimiento: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloInventario.obtenerMovimientoPorId(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Movimiento no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo movimiento:', error);
      res.status(500).json({ error: 'Error al obtener el movimiento' });
    }
  },

  // Obtener historial de un producto
  obtenerHistorialProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloInventario.obtenerHistorialProducto(id);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  },

  // Obtener kardex de producto
  obtenerKardexProducto: async (req, res) => {
    try {
      const id = req.params.id;
      const resultados = await ModeloInventario.obtenerKardexProducto(id);
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo kardex:', error);
      res.status(500).json({ error: 'Error al obtener kardex' });
    }
  },

  // Obtener productos con stock bajo
  obtenerProductosStockBajo: async (req, res) => {
    try {
      const resultados = await ModeloInventario.obtenerProductosStockBajo();

      // Clasificar alertas
      const alertas = resultados.map(producto => {
        let tipoAlerta = '';
        let mensaje = '';
        let severidad = 'warning';

        if (producto.p_stock <= 0) {
          tipoAlerta = 'sin_stock';
          mensaje = 'Producto agotado';
          severidad = 'danger';
        } else if (producto.p_stock <= producto.p_stock_minimo) {
          tipoAlerta = 'stock_bajo';
          mensaje = `Stock bajo: ${producto.p_stock} unidades (mínimo: ${producto.p_stock_minimo})`;
          severidad = 'warning';
        }

        if (producto.p_fecha_vencimiento && producto.dias_para_vencer <= 7) {
          tipoAlerta = tipoAlerta ? `${tipoAlerta}_vencimiento` : 'vencimiento';
          mensaje = tipoAlerta ? `${mensaje} - ` : '';
          mensaje += `Vence en ${producto.dias_para_vencer} días`;
          severidad = producto.dias_para_vencer <= 3 ? 'danger' : 'warning';
        }

        return {
          ...producto,
          alerta: {
            tipo: tipoAlerta,
            mensaje: mensaje,
            severidad: severidad
          }
        };
      });

      res.json(alertas);
    } catch (error) {
      console.error('Error obteniendo productos stock bajo:', error);
      res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
    }
  },

  // Obtener productos próximos a vencer
  obtenerProductosProximosVencer: async (req, res) => {
    try {
      const resultados = await ModeloInventario.obtenerProductosProximosVencer();
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo productos próximos a vencer:', error);
      res.status(500).json({ error: 'Error al obtener productos próximos a vencer' });
    }
  },

  // Obtener estadísticas de inventario
  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloInventario.obtenerEstadisticas();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
};

export default ControladorInventario;