import ModeloCaja from '../modelos/ModeloCaja.js';

const ControladorCaja = {
  // Abrir una nueva caja
  abrirCaja: async (req, res) => {
    try {
      const { monto_inicial } = req.body;
      const id_usuario = req.userId;

      // Validaciones
      if (monto_inicial === undefined || monto_inicial === null || monto_inicial < 0) {
        return res.status(400).json({ error: 'Monto inicial es requerido y debe ser mayor o igual a 0' });
      }

      // Verificar si ya existe una caja abierta para este usuario
      const cajasAbiertas = await ModeloCaja.obtenerCajaAbiertaPorUsuario(id_usuario);
      
      if (cajasAbiertas.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe una caja abierta para este usuario',
          caja_abierta: cajasAbiertas[0]
        });
      }

      // Crear nueva caja
      const caja = {
        monto_inicial: parseFloat(monto_inicial),
        id_usuario: id_usuario,
        fecha_apertura: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const resultadoCreacion = await ModeloCaja.abrirCaja(caja);

      res.status(201).json({
        mensaje: 'Caja abierta exitosamente',
        id_caja: resultadoCreacion.insertId,
        caja: caja
      });
    } catch (error) {
      console.error('Error abriendo caja:', error);
      res.status(500).json({ error: 'Error al abrir la caja' });
    }
  },

  // Cerrar caja
  cerrarCaja: async (req, res) => {
    try {
      const id_caja = req.params.id;
      const { monto_final } = req.body;
      const id_usuario = req.userId;

      // Validaciones
      if (monto_final === undefined || monto_final === null || monto_final < 0) {
        return res.status(400).json({ error: 'Monto final es requerido y debe ser mayor o igual a 0' });
      }

      // Verificar que la caja existe y está abierta
      const cajas = await ModeloCaja.obtenerCajaPorId(id_caja);
      
      if (cajas.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }

      const caja = cajas[0];

      if (caja.ca_estado === 'cerrada') {
        return res.status(400).json({ error: 'La caja ya está cerrada' });
      }

      if (caja.ca_usuarioFK !== id_usuario) {
        return res.status(403).json({ error: 'Solo el usuario que abrió la caja puede cerrarla' });
      }

      // Calcular total de ventas
      const totalVentas = await ModeloCaja.obtenerTotalVentasPorCaja(id_caja);

      // Cerrar la caja
      const datosCierre = {
        monto_final: parseFloat(monto_final),
        fecha_cierre: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const resultadoCierre = await ModeloCaja.cerrarCaja(id_caja, datosCierre);

      if (resultadoCierre.affectedRows === 0) {
        return res.status(404).json({ error: 'Error al cerrar la caja' });
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
    } catch (error) {
      console.error('Error cerrando caja:', error);
      res.status(500).json({ error: 'Error al cerrar la caja' });
    }
  },

  // Obtener caja por ID
  obtenerCaja: async (req, res) => {
    try {
      const id = req.params.id;
      const cajas = await ModeloCaja.obtenerCajaPorId(id);
      
      if (cajas.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }
      
      const caja = cajas[0];

      // Si la caja está abierta, obtener el total de ventas
      if (caja.ca_estado === 'abierta') {
        const totalVentas = await ModeloCaja.obtenerTotalVentasPorCaja(id);
        
        res.json({
          ...caja,
          total_ventas: totalVentas[0].total_ventas
        });
      } else {
        res.json(caja);
      }
    } catch (error) {
      console.error('Error obteniendo caja:', error);
      res.status(500).json({ error: 'Error al obtener la caja' });
    }
  },

  // Obtener caja abierta del usuario actual
  obtenerCajaAbierta: async (req, res) => {
    try {
      const id_usuario = req.userId;
      const cajasAbiertas = await ModeloCaja.obtenerCajaAbiertaPorUsuario(id_usuario);
      
      if (cajasAbiertas.length === 0) {
        return res.status(404).json({ error: 'No hay caja abierta para este usuario' });
      }
      
      const caja = cajasAbiertas[0];

      // Obtener el total de ventas para la caja abierta
      const totalVentas = await ModeloCaja.obtenerTotalVentasPorCaja(caja.ca_id);
      
      res.json({
        ...caja,
        total_ventas: totalVentas[0].total_ventas
      });
    } catch (error) {
      console.error('Error obteniendo caja abierta:', error);
      res.status(500).json({ error: 'Error al obtener la caja abierta' });
    }
  },

  // Obtener todas las cajas con filtros
  obtenerCajas: async (req, res) => {
    try {
      const { estado, usuario, fecha_inicio, fecha_fin } = req.query;
      const filtros = {};

      if (estado) filtros.estado = estado;
      if (usuario) filtros.usuario = usuario;
      if (fecha_inicio) filtros.fecha_inicio = fecha_inicio;
      if (fecha_fin) filtros.fecha_fin = fecha_fin;

      const resultados = await ModeloCaja.obtenerCajas(filtros);
      res.json(resultados);
    } catch (error) {
      console.error('Error obteniendo cajas:', error);
      res.status(500).json({ error: 'Error al obtener las cajas' });
    }
  },

  // Obtener estadísticas de caja
  obtenerEstadisticas: async (req, res) => {
    try {
      const resultados = await ModeloCaja.obtenerEstadisticasCaja();
      res.json(resultados[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Obtener la última caja abierta (sin importar usuario - para validación de ventas)
  obtenerUltimaCajaAbierta: async (req, res) => {
    try {
      const cajasAbiertas = await ModeloCaja.obtenerUltimaCajaAbierta();
      
      if (cajasAbiertas.length === 0) {
        return res.status(404).json({ error: 'No hay cajas abiertas' });
      }
      
      const caja = cajasAbiertas[0];

      // Obtener el total de ventas para la caja abierta
      const totalVentas = await ModeloCaja.obtenerTotalVentasPorCaja(caja.ca_id);
      
      res.json({
        ...caja,
        total_ventas: totalVentas[0].total_ventas
      });
    } catch (error) {
      console.error('Error obteniendo última caja abierta:', error);
      res.status(500).json({ error: 'Error al obtener la última caja abierta' });
    }
  }
};

export default ControladorCaja;