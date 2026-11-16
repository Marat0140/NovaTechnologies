import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function Navbar({ role = 'guest' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Detectar el rol real del usuario decodificando el token JWT si está disponible
  let currentRole = role;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.role) {
        currentRole = payload.role; // 'client', 'technician', 'admin'
      }
    } catch (e) {
      console.error('Error al decodificar el token:', e);
    }
  }

  // Definir la ruta del dashboard según el rol
  const getDashboardRoute = () => {
    if (currentRole === 'technician') return '/technician-dashboard';
    if (currentRole === 'admin') return '/admin-dashboard';
    return '/client-dashboard';
  };

  const dashboardRoute = getDashboardRoute();
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    navigate('/login');
  };

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
    <header style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)', height: '70px', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '14px 20px' }}>
        
        {/* Logo con imagen */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
          <img src={logoImg} alt="Nova Technologies" style={{ width: 'auto', height: '42px', objectFit: 'contain', borderRadius: '6px' }} />
          <span>Nova Technologies</span>
        </Link>

        {/* Enlaces de Escritorio */}
        <nav className="desktop-nav-links" style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Inicio</Link>

          {isHome && (
            <>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Sobre nosotros</button>
              <button onClick={() => scrollToSection('services')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Servicios</button>
              {/*<button onClick={() => scrollToSection('warranties')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', padding: 0 }}>Garantías</button>*/}
            </>
          )}

          <Link to="/contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Soporte / Contacto</Link>
          
          {/* Enlaces si tiene sesión iniciada */}
          {token && (
            <>
              <Link to={dashboardRoute} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                🚀 Ir a mi Panel
              </Link>
              {currentRole === 'client' && (
                <Link to="/create-request" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Nueva Solicitud</Link>
              )}
              {currentRole === 'technician' && (
                <Link to="/technician-profile" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Mi Perfil</Link>
              )}
            </>
          )}
        </nav>

        {/* Botones de Autenticación */}
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

          {isHome && (
            <>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>ℹ️ Sobre nosotros</button>
              <button onClick={() => scrollToSection('services')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>⚙️ Servicios</button>
              <button onClick={() => scrollToSection('warranties')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '15px', textAlign: 'left', cursor: 'pointer', padding: '6px 0' }}>🛡️ Garantías</button>
            </>
          )}

          <Link to="/contact" onClick={() => setMenuOpen(false)} style={{ color: '#e5e7eb', textDecoration: 'none', fontSize: '15px', padding: '6px 0' }}>
            📞 Soporte y Contacto
          </Link>

          {token && (
            <Link to={dashboardRoute} onClick={() => setMenuOpen(false)} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '15px', padding: '6px 0', fontWeight: '600' }}>
              🚀 Ir a mi Panel de Control
            </Link>
          )}
        </div>
      )}
    </header>
  );
}