const ModeloCaja = require('../modelos/ModeloCaja');
const ModeloVenta = require('../modelos/ModeloVenta');

const ControladorCaja = {
  // Abrir una nueva caja
  abrirCaja: (req, res) => {
    const { monto_inicial } = req.body;
    const id_usuario = req.userId;

    // Validaciones
    if (monto_inicial === undefined || monto_inicial === null || monto_inicial < 0) {
      return res.status(400).json({ error: 'Monto inicial es requerido y debe ser mayor o igual a 0' });
    }

    // Verificar si ya existe una caja abierta para este usuario
    ModeloCaja.obtenerCajaAbiertaPorUsuario(id_usuario, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (resultados.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe una caja abierta para este usuario',
          caja_abierta: resultados[0]
        });
      }

      // Crear nueva caja
      const caja = {
        monto_inicial: parseFloat(monto_inicial),
        id_usuario: id_usuario,
        fecha_apertura: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      ModeloCaja.abrirCaja(caja, (err, resultados) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          mensaje: 'Caja abierta exitosamente',
          id_caja: resultados.insertId,
          caja: caja
        });
      });
    });
  },

  // Cerrar caja
  cerrarCaja: (req, res) => {
    const id_caja = req.params.id;
    const { monto_final } = req.body;
    const id_usuario = req.userId;

    // Validaciones
    if (monto_final === undefined || monto_final === null || monto_final < 0) {
      return res.status(400).json({ error: 'Monto final es requerido y debe ser mayor o igual a 0' });
    }

    // Verificar que la caja existe y está abierta
    ModeloCaja.obtenerCajaPorId(id_caja, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }

      const caja = resultados[0];

      if (caja.ca_estado === 'cerrada') {
        return res.status(400).json({ error: 'La caja ya está cerrada' });
      }

      if (caja.ca_usuarioFK !== id_usuario) {
        return res.status(403).json({ error: 'Solo el usuario que abrió la caja puede cerrarla' });
      }

      // Calcular total de ventas
      ModeloCaja.obtenerTotalVentasPorCaja(id_caja, (err, totalVentas) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Cerrar la caja
        const datosCierre = {
          monto_final: parseFloat(monto_final),
          fecha_cierre: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        ModeloCaja.cerrarCaja(id_caja, datosCierre, (err, resultados) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({
            mensaje: 'Caja cerrada exitosamente',
            caja: {
              ...caja,
              ca_monto_final: datosCierre.monto_final,
              ca_fecha_cierre: datosCierre.fecha_cierre,
              ca_estado: 'cerrada'
            },
            total_ventas: totalVentas[0].total_ventas
          });
        });
      });
    });
  },

  // Obtener caja por ID
  obtenerCaja: (req, res) => {
    const id = req.params.id;

    ModeloCaja.obtenerCajaPorId(id, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }
      
      // Si la caja está abierta, obtener el total de ventas
      if (resultados[0].ca_estado === 'abierta') {
        ModeloCaja.obtenerTotalVentasPorCaja(id, (err, totalVentas) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({
            ...resultados[0],
            total_ventas: totalVentas[0].total_ventas
          });
        });
      } else {
        res.json(resultados[0]);
      }
    });
  },

  // Obtener caja abierta del usuario actual
  obtenerCajaAbierta: (req, res) => {
    const id_usuario = req.userId;

    ModeloCaja.obtenerCajaAbiertaPorUsuario(id_usuario, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (resultados.length === 0) {
        return res.status(404).json({ error: 'No hay caja abierta para este usuario' });
      }
      
      // Obtener el total de ventas para la caja abierta
      ModeloCaja.obtenerTotalVentasPorCaja(resultados[0].ca_id, (err, totalVentas) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          ...resultados[0],
          total_ventas: totalVentas[0].total_ventas
        });
      });
    });
  },

  // Obtener todas las cajas con filtros
  obtenerCajas: (req, res) => {
    const { estado, usuario, fecha_inicio, fecha_fin } = req.query;
    const filtros = {};

    if (estado) filtros.estado = estado;
    if (usuario) filtros.usuario = usuario;
    if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
    if (fecha_fin) filtros.fecha_fin = fecha_fin;

    ModeloCaja.obtenerCajas(filtros, (err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados);
    });
  },

  // Obtener estadísticas de caja
  obtenerEstadisticas: (req, res) => {
    ModeloCaja.obtenerEstadisticasCaja((err, resultados) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(resultados[0]);
    });
  },

  // Obtener la última caja abierta (sin importar usuario - para validación de ventas)
obtenerUltimaCajaAbierta: (req, res) => {
  ModeloCaja.obtenerUltimaCajaAbierta((err, resultados) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No hay cajas abiertas' });
    }
    
    // Obtener el total de ventas para la caja abierta
    ModeloCaja.obtenerTotalVentasPorCaja(resultados[0].ca_id, (err, totalVentas) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        ...resultados[0],
        total_ventas: totalVentas[0].total_ventas
      });
    });
  });
},
};

module.exports = ControladorCaja;