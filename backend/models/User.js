/* ==========================================================================
   NOVA TECHNOLOGIES - MODELO DE USUARIO (MongoDB / Mongoose)
   ========================================================================== */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => Math.floor(1000000000 + Math.random() * 9000000000).toString() // ID único de 10 dígitos
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Opcional si inicia con Google
  googleId: { type: String }, // Opcional si inicia con correo tradicional
  role: { type: String, enum: ['client', 'technician', 'admin'], default: 'client' },
  age: { type: Number, required: true },
  birthDate: { type: String, required: true },
  profilePic: { type: String }, // Guardaremos la imagen en formato Base64 o URL
  identityDoc: { 
    type: String, 
    required: function() { return this.role === 'technician'; } // Obligatorio solo si es técnico
  },
  specialties: { 
    type: [String], 
    default: [] // Array de especialidades para técnicos
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);