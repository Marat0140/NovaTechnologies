import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('https://proyecto-avanzado-jc.onrender.com/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (res.ok) {
        alert('¡Mensaje enviado con éxito! Nuestro equipo de soporte lo revisará a la brevedad.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        alert('Error al enviar el mensaje.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)', height: '70px', display: 'flex', alignItems: 'center' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <img src={logoImg} alt="Nova Technologies" style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
            <span className="brand-name">Nova Technologies</span>
          </Link>
          <nav className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/" className="nav-link" style={{ color: '#9ca3af', textDecoration: 'none' }}>Inicio</Link>
            <Link to="/contact" className="nav-link" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Soporte / Contacto</Link>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '35px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>📞 Centro de Soporte y Contacto</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '25px' }}>¿Tienes dudas con una reparación, problemas con tu cuenta o requieres asistencia técnica general? Envíanos un mensaje.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Nombre Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Tu nombre" 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' }} 
                required 
              />
            </div>

            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Correo Electrónico</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="correo@ejemplo.com" 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' }} 
                required 
              />
            </div>

            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Asunto o Motivo</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' }} 
                required
              >
                <option value="">Selecciona un motivo...</option>
                <option value="Soporte con Orden">🛠️ Soporte con una Orden Activa</option>
                <option value="Problema con Cuenta">🔐 Problemas de Acceso / Cuenta</option>
                <option value="Alianzas y Talleres">💼 Unirme como Técnico / Taller</option>
                <option value="Otro">💬 Otra consulta</option>
              </select>
            </div>

            <div style={{ marginBottom: '22px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Mensaje</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows="4" 
                placeholder="Escribe los detalles de tu consulta..." 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'vertical' }} 
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Enviando...' : 'Enviar Mensaje de Soporte'}
            </button>
          </form>
        </div>
      </main>

    </div>
  );
}