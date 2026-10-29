const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Google Auth Check (Devuelve si necesita completar registro o entra directo)
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ needsRoleSelection: true }); // Dispara el wizard en el frontend
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, needsRoleSelection: false });
  } catch (error) {
    res.status(500).json({ message: 'Error al autenticar con Google.', error: error.message });
  }
});

// 2. Login Tradicional
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas.' });

    if (!user.password) {
      return res.status(400).json({ message: 'Esta cuenta usa acceso por Google. Inicia sesión con Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas.' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, message: 'Inicio de sesión exitoso.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor.', error: error.message });
  }
});

// 3. Ruta Definitiva de Registro (Recopila todos los datos del wizard y guarda en Atlas)
router.post('/complete-registration', async (req, res) => {
  try {
    const { authType, credential, name, email, password, role, age, birthDate, identityDoc, profilePic, specialties } = req.body;

    let finalName = name;
    let finalEmail = email;
    let googleId = null;
    let hashedPassword = null;

    // Si el registro viene de Google, verificamos el token oficial
    if (authType === 'google') {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      finalName = payload.name;
      finalEmail = payload.email;
      googleId = payload.sub;
    } else if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Validar si el correo ya existe
    let existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Validaciones estrictas para técnicos
    if (role === 'technician') {
      if (!identityDoc) return res.status(400).json({ message: 'El documento de identidad es obligatorio para técnicos.' });
      if (!profilePic) return res.status(400).json({ message: 'La foto de perfil es obligatoria para técnicos.' });
    }

    // Crear el nuevo usuario con ID de 10 dígitos automático y único
    const newUser = new User({
      name: finalName,
      email: finalEmail,
      password: hashedPassword,
      googleId,
      role: role || 'client',
      age: Number(age),
      birthDate,
      identityDoc: role === 'technician' ? identityDoc : undefined,
      profilePic: profilePic || '',
      specialties: role === 'technician' ? specialties : []
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      token, 
      role: newUser.role, 
      userId: newUser.userId, 
      message: 'Registro completado con éxito y guardado en la base de datos.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el registro en la base de datos.', error: error.message });
  }
});

module.exports = router;