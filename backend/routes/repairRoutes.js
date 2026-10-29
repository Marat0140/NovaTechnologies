const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const RepairRequest = require('../models/RepairRequest');

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

// 1. Crear Solicitud de Reparación
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { technicianId, deviceCategory, deviceModel, issueDescription } = req.body;

    const newRequest = new RepairRequest({
      clientId: req.user.id,
      technicianId,
      deviceCategory,
      deviceModel,
      issueDescription
    });

    await newRequest.save();
    res.status(201).json({ message: 'Solicitud creada con éxito.', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la solicitud.', error: error.message });
  }
});

// 2. Obtener solicitudes del cliente actual (Mi Garaje)
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await RepairRequest.find({ clientId: req.user.id })
      .populate('technicianId', 'name profilePic email')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar solicitudes.', error: error.message });
  }
});

// 3. Enviar mensaje al chat de una orden
router.post('/:requestId/chat', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const request = await RepairRequest.findById(req.params.requestId);

    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    request.chatMessages.push({
      senderId: req.user.id,
      senderRole: req.user.role,
      message
    });

    await request.save();
    res.json({ message: 'Mensaje enviado.', chatMessages: request.chatMessages });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar mensaje.', error: error.message });
  }
});

// 1. Obtener solicitudes asignadas al técnico autenticado
router.get('/technician-requests', verifyToken, async (req, res) => {
  try {
    const requests = await RepairRequest.find({ technicianId: req.user.id })
      .populate('clientId', 'name email profilePic')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar órdenes del técnico.', error: error.message });
  }
});

// 2. Aceptar orden y asignar presupuesto
router.put('/:id/accept', verifyToken, async (req, res) => {
  try {
    const { priceQuote } = req.body;
    const request = await RepairRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    request.status = 'quoted';
    request.priceQuote = priceQuote;
    await request.save();

    res.json({ message: 'Orden actualizada con éxito.', request });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la orden.', error: error.message });
  }
});

// Obtener detalles completos de una orden para el chat
router.get('/:id/details', verifyToken, async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id)
      .populate('clientId', 'name email profilePic')
      .populate('technicianId', 'name email profilePic');

    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    res.json({ 
      request, 
      currentUserId: req.user.id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar la orden.', error: error.message });
  }
});

// 1. Cliente responde a la cotización inicial (Aceptar o Rechazar)
router.put('/:id/respond-quote', verifyToken, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' o 'reject'
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    if (action === 'accept') {
      request.status = 'in_repair';
      await request.save();
      return res.json({ message: 'Cotización aceptada. La reparación ha iniciado.', request });
    } else if (action === 'reject') {
      // Generar OTP de cancelación (debe pagar revisión)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      request.status = 'pending_cancellation';
      request.cancellationOtp = otp;
      await request.save();
      return res.json({ 
        message: 'Cotización rechazada. Se requiere cancelar y pagar tarifa de revisión.', 
        cancellationOtp: otp, // En producción se enviaría por correo, aquí lo devolvemos para pruebas
        request 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar la respuesta.', error: error.message });
  }
});

// 2. Técnico propone un cambio de precio (Re-cotización)
router.put('/:id/propose-price', verifyToken, async (req, res) => {
  try {
    const { newPrice } = req.body;
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    request.priceModification = {
      newPrice: Number(newPrice),
      status: 'pending'
    };
    await request.save();

    res.json({ message: 'Propuesta de cambio de precio enviada al cliente.', request });
  } catch (error) {
    res.status(500).json({ message: 'Error al proponer nuevo precio.', error: error.message });
  }
});

// 3. Cliente responde al cambio de precio (Aceptar o Rechazar)
router.put('/:id/respond-price-mod', verifyToken, async (req, res) => {
  try {
    const { action } = req.body; // 'accept' o 'reject'
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    if (action === 'accept') {
      request.priceQuote = request.priceModification.newPrice;
      request.priceModification.status = 'accepted';
      await request.save();
      return res.json({ message: 'Nuevo precio aceptado. La reparación continúa.', request });
    } else if (action === 'reject') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      request.priceModification.status = 'rejected';
      request.status = 'pending_cancellation';
      request.cancellationOtp = otp;
      await request.save();
      return res.json({ 
        message: 'Nuevo precio rechazado. Orden pendiente de cancelación por tarifa de revisión.', 
        cancellationOtp: otp,
        request 
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al responder al cambio de precio.', error: error.message });
  }
});

// 4. Confirmar cancelación con OTP (Tarifa de revisión pagada)
router.put('/:id/confirm-cancellation', verifyToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    if (request.cancellationOtp !== otp) {
      return res.status(400).json({ message: 'Código OTP de cancelación incorrecto.' });
    }

    request.status = 'cancelled';
    await request.save();
    res.json({ message: 'Orden cancelada exitosamente tras confirmar pago de revisión.', request });
  } catch (error) {
    res.status(500).json({ message: 'Error al confirmar cancelación.', error: error.message });
  }
});

// 5. Técnico solicita código OTP de finalización
router.post('/:id/request-completion-otp', verifyToken, async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    request.completionOtp = otp;
    await request.save();

    res.json({ message: 'Código OTP generado.', completionOtp: otp });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar OTP.', error: error.message });
  }
});

// 6. Técnico ingresa OTP de finalización para marcar como completado
router.put('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { otp } = res.req.body;
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Orden no encontrada.' });

    if (request.completionOtp !== otp) {
      return res.status(400).json({ message: 'Código OTP de finalización incorrecto.' });
    }

    request.status = 'completed';
    await request.save();
    res.json({ message: '¡Reparación completada y entregada con éxito!', request });
  } catch (error) {
    res.status(500).json({ message: 'Error al completar la orden.', error: error.message });
  }
});

module.exports = router;