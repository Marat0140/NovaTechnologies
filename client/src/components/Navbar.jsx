import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ role = 'guest' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Saber si estamos exactamente en la página de inicio
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    navigate('/login');
  };

  // Función para hacer scroll suave a las secciones del Home
  const scrollToSection = (sectionId) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '14px 20px' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
          <span>⚡</span>
          <span>Nova Technologies</span>
        </Link>

        {/* Enlaces de Escritorio */}
        <nav className="desktop-nav-links" style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Inicio</Link>

          {/* Enlaces exclusivos del Home (Secciones de la página principal) */}
          {isHome && (
            <>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Sobre nosotros</button>
              <button onClick={() => scrollToSection('services')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Servicios</button>
              <button onClick={() => scrollToSection('warranties')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Garantías</button>
            </>
          )}

          <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Soporte / Contacto</Link>
          
          {token && role === 'client' && (
            <>
              <Link to="/client-dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Mi Panel</Link>
              <Link to="/create-request" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Nueva Solicitud</Link>
            </>
          )}

          {token && role === 'technician' && (
            <>
              <Link to="/technician-dashboard" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Panel Técnico</Link>
              <Link to="/technician-profile" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Mi Perfil</Link>
            </>
          )}
        </nav>

        {/* Botones Principales + Botón Hamburguesa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!token ? (
            <>
              <Link to="/login" style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500', padding: '7px 12px' }}>
                Ingresar
              </Link>
              <Link to="/login?mode=register" style={{ background: '#3b82f6', color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '600', padding: '8px 14px', borderRadius: '8px' }}>
                Registrarse
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              Salir
            </button>
          )}

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

      </div>

      {/* Menú Desplegable en Celular */}
      {menuOpen && (
        <div className="mobile-dropdown">
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '15px', padding: '6px 0' }}>
            🏠 Inicio
          </Link>

          {/* Opciones del Home en el menú móvil */}
          {isHome && (
            <>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>ℹ️ Sobre nosotros</button>
              <button onClick={() => scrollToSection('specialties')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>⚙️ Especialidades</button>
              <button onClick={() => scrollToSection('warranties')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>🛡️ Garantías</button>
            </>
          )}

          <Link to="/contact" onClick={() => setMenuOpen(false)} style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '15px', padding: '6px 0' }}>
            📞 Soporte y Contacto
          </Link>

          {token && role === 'client' && (
            <>
              <Link to="/client-dashboard" onClick={() => setMenuOpen(false)} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '15px', padding: '6px 0', fontWeight: '500' }}>
                📋 Mis Órdenes de Reparación
              </Link>
              <Link to="/create-request" onClick={() => setMenuOpen(false)} style={{ color: '#10b981', textDecoration: 'none', fontSize: '15px', padding: '6px 0', fontWeight: '500' }}>
                ➕ Solicitar Nueva Reparación
              </Link>
            </>
          )}

          {token && role === 'technician' && (
            <>
              <Link to="/technician-dashboard" onClick={() => setMenuOpen(false)} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '15px', padding: '6px 0', fontWeight: '500' }}>
                🛠️ Panel de Trabajos
              </Link>
              <Link to="/technician-profile" onClick={() => setMenuOpen(false)} style={{ color: '#10b981', textDecoration: 'none', fontSize: '15px', padding: '6px 0', fontWeight: '500' }}>
                👤 Mi Perfil Técnico
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}