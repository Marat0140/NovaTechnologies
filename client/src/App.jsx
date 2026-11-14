import React from 'react';
import { Router, Routes, Route, Navigate } from 'react-router-dom';

// Importación de tus estilos CSS
import './global.css';
import './components.css';
import './index.css';
import './login.css';

import Home from './views/Home';
import Login from './views/Login';
import ClientDashboard from './views/ClientDashboard';
import TechnicianDashboard from './views/TechnicianDashboard';
import TechnicianProfile from './views/TechnicianProfile';
import CreateRequest from './views/CreateRequest';
import RepairChat from './views/RepairChat';
import Contact from './views/Contact';
import AdminDashboard from './views/AdminDashboard';

function App() {
  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
        <Route path="/technician-profile" element={<TechnicianProfile />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/create-request" element={<CreateRequest />} />
        <Route path="/repair-chat" element={<RepairChat />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    
  );
}

export default App;