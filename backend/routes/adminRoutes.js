const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RepairRequest = require('../models/RepairRequest');
const SupportTicket = require('../models/SupportTicket');

// Middleware para verificar JWT y asegurar que sea Administrador
const verifyAdmin = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado. No hay token.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido o expirado.' });
  }
};

// 1. Obtener Estadísticas Generales del Sistema
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalTechnicians = await User.countDocuments({ role: 'technician' });
    const totalOrders = await RepairRequest.countDocuments();
    const pendingTickets = await SupportTicket.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalClients,
      totalTechnicians,
      totalOrders,
      pendingTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al consultar estadísticas.', error: error.message });
  }
});

// 2. Obtener Lista de Todos los Usuarios
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
});

// 3. Obtener Todos los Tickets de Soporte
router.get('/tickets', verifyAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets de soporte.', error: error.message });
  }
});

// 4. Cambiar Estado de un Ticket de Soporte
router.put('/tickets/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado.' });

    ticket.status = status;
    await ticket.save();
    res.json({ message: 'Estado del ticket actualizado con éxito.', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar ticket.', error: error.message });
  }
});

// 5. Endpoint Público: Guardar Ticket de Soporte desde contact.html
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const newTicket = new SupportTicket({ name, email, subject, message });
    await newTicket.save();
    res.status(201).json({ message: 'Mensaje de soporte registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar el mensaje de soporte.', error: error.message });
  }
});

// Obtener todas las órdenes de reparación globales (Admin)
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await RepairRequest.find()
      .populate('clientId', 'name email')
      .populate('technicianId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las órdenes globales.', error: error.message });
  }
});

module.exports = router;