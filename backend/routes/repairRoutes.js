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

module.exports = router;