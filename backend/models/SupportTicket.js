const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_review', 'resolved'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);