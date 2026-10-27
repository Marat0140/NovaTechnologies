const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. Obtener todos los técnicos -> Responde en GET /api/technicians
router.get('/', async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('-password');
    res.json({ technicians });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los técnicos.', error: error.message });
  }
});

// 2. Obtener un técnico por ID -> Responde en GET /api/technicians/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { role: 'technician' };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query.$or = [{ _id: id }, { userId: id }];
    } else {
      query.userId = id;
    }

    const technician = await User.findOne(query).select('-password');
    
    if (!technician) {
      return res.status(404).json({ message: 'Técnico no encontrado.' });
    }

    res.json({ technician });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el perfil.', error: error.message });
  }
});

module.exports = router;