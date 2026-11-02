/* ==========================================================================
   NOVA TECHNOLOGIES - SERVER.JS (Backend Principal)
   ========================================================================== */
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Cargar variables de entorno desde el archivo .env en la raíz
dotenv.config({ path: path.join(__dirname, '../.env') });

// Conectar a la base de datos de MongoDB Atlas
connectDB();

const app = express();

// Middlewares globales
app.use(express.json());
app.use(cors());

// Rutas de la API (las iremos conectando paso a paso)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/technicians', require('./routes/userRoutes'));
app.use('/api/repairs', require('./routes/repairRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;

// Verificar que cargó bien (esto te imprimirá true si lee la URI)
console.log("URI cargada:", process.env.MONGO_URI ? "Sí" : "No");

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Nova Technologies corriendo en el puerto ${PORT}`);
});