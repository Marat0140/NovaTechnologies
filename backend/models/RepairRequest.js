const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    default: () => Math.floor(1000000000 + Math.random() * 9000000000).toString() // ID de 10 dígitos para la orden
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceCategory: { 
    type: String, 
    enum: ['Celulares y Tablets', 'Consolas y Controles', 'Computadoras y Laptops'], 
    required: true 
  },
  deviceModel: { type: String, required: true }, // Ej: "PlayStation 5", "iPhone 13", "Asus Laptop"
  issueDescription: { type: String, required: true },
  deviceImages: [{ type: String }], // Array de fotos del equipo (Base64 o URL)
  
  // Control de estados de la reparación
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in_diagnosis', 'quoted', 'in_repair', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  
  priceQuote: { type: Number, default: 0 }, // Presupuesto definido por el técnico
  otpCode: { type: String }, // Código OTP de validación para liberar pago/entrega
  
  // Historial de mensajes (Chat persistente entre Cliente y Técnico)
  chatMessages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: { type: String, enum: ['client', 'technician'] },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('RepairRequest', repairRequestSchema);