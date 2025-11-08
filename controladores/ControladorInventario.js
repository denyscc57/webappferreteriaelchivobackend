const ModeloInventario = require('../modelos/ModeloInventario');
const ModeloProducto = require('../modelos/ModeloProducto');

const ControladorInventario = {
  // Registrar movimiento de inventario
  registrarMovimiento: (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, motivo, fecha, hora } = req.body;
  const id_usuario = req.userId; // ← Esto viene del middleware de autenticación

    // Validaciones
    if (!id_producto || !tipo_movimiento || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    if (!['entrada', 'salida'].includes(tipo_movimiento)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' });
    }

    // Verificar que el producto existe
    ModeloProducto.obtenerPorId(id_producto, (err, resultadosProducto) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

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

      ModeloInventario.registrarMovimiento(movimiento, (err, resultadosMovimiento) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Actualizar el stock del producto
        const nuevoStock = tipo_movimiento === 'entrada' 
          ? producto.p_stock + cantidad 
          : producto.p_stock - cantidad;

        ModeloProducto.actualizarStock(id_producto, 
          tipo_movimiento === 'entrada' ? cantidad : -cantidad, 
          (err, resultadosStock) => {
            if (err) {
              return res.status(500).json({ error: 'Error al actualizar stock: ' + err.message });
            }

            res.status(201).json({
              mensaje: `Movimiento de ${tipo_movimiento} registrado exitosamente`,
              id_movimiento: resultadosMovimiento.insertId,
              stock_anterior: producto.p_stock,
              stock_nuevo: nuevoStock,
              movimiento: movimiento
            });
          }
        );
      });
    });
  },

  // Obtener todos los movimientos
  obtenerMovimientos: (req, res) => {
    const { producto, tipo, fecha_inicio, fecha_fin } = req.query;
    const filtros = {};

    if (producto) filtros.producto = producto;
    if (tipo) filtros.tipo = tipo;
    if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
    if (fecha_fin) filtros.fecha_fin = fecha_fin;

    ModeloInventario.obtenerMovimientos(filtros, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Obtener movimiento por ID
  obtenerMovimiento: (req, res) => {
    const id = req.params.id;

    ModeloInventario.obtenerMovimientoPorId(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Movimiento no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  // Obtener historial de un producto
  obtenerHistorialProducto: (req, res) => {
    const id = req.params.id;

    ModeloInventario.obtenerHistorialProducto(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Obtener kardex de producto
  obtenerKardexProducto: (req, res) => {
    const id = req.params.id;

    ModeloInventario.obtenerKardexProducto(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(resultados[0]);
    });
  },

  // Obtener productos con stock bajo
  obtenerProductosStockBajo: (req, res) => {
    ModeloInventario.obtenerProductosStockBajo((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

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
    });
  },

  // Obtener productos próximos a vencer
  obtenerProductosProximosVencer: (req, res) => {
    ModeloInventario.obtenerProductosProximosVencer((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Obtener estadísticas de inventario
  obtenerEstadisticas: (req, res) => {
    ModeloInventario.obtenerEstadisticas((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados[0]);
    });
  }
};

module.exports = ControladorInventario;