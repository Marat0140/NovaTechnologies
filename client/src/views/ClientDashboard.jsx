import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AIChatWidget from '../components/AIChatWidget';
import logoImg from '../assets/Logo.png';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechs, setFilteredTechs] = useState([]);
  const [clientRequests, setClientRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingTechs, setLoadingTechs] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchTechnicians(token);
    fetchClientRequests(token);
  }, [navigate]);

  // Obtener técnicos de la API
  const fetchTechnicians = async (token) => {
    try {
      const res = await fetch('https://proyecto-avanzado-jc.onrender.com/api/technicians', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTechnicians(data.technicians);
        setFilteredTechs(data.technicians);
      }
    } catch (error) {
      console.error('Error cargando técnicos:', error);
    } finally {
      setLoadingTechs(false);
    }
  };

  // Obtener solicitudes o "Garaje" del cliente
  const fetchClientRequests = async (token) => {
    try {
      const res = await fetch('https://proyecto-avanzado-jc.onrender.com/api/repairs/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClientRequests(data.requests);
      }
    } catch (error) {
      console.error('Error cargando garaje:', error);
    }
  };

  // Filtrar técnicos por especialidad
  const handleFilterChange = (specialty) => {
    setActiveFilter(specialty);
    if (specialty === 'all') {
      setFilteredTechs(technicians);
    } else {
      const filtered = technicians.filter(tech => tech.specialties && tech.specialties.includes(specialty));
      setFilteredTechs(filtered);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar del Cliente */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)', height: '70px', display: 'flex', alignItems: 'center' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Link to="/client-dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <img src={logoImg} alt="Nova Technologies" style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
            <span className="brand-name">Nova Technologies <span style={{ fontSize: '12px', background: '#3b82f6', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>Cliente</span></span>
          </Link>
          
          <nav className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/client-dashboard" className="nav-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>Mi Garaje</Link>
            <Link to="/contact" className="nav-link" style={{ color: '#9ca3af', textDecoration: 'none' }}>Soporte</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Cerrar Sesión</button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Sección de Bienvenida */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '30px', borderRadius: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#fff' }}>¡Bienvenido de nuevo!</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Selecciona el tipo de dispositivo que necesitas reparar para conectar con técnicos especializados.</p>
          </div>
        </div>

        {/* Filtros por Categoría de Dispositivo */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#e5e7eb' }}>Filtra técnicos por especialidad:</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Todos', value: 'all' },
              { label: '📱 Celulares y Tablets', value: 'Celulares y Tablets' },
              { label: '🎮 Consolas y Controles', value: 'Consolas y Controles' },
              { label: '💻 Computadoras y Laptops', value: 'Computadoras y Laptops' }
            ].map(cat => (
              <button
                key={cat.value}
                onClick={() => handleFilterChange(cat.value)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${activeFilter === cat.value ? '#3b82f6' : '#374151'}`,
                  background: activeFilter === cat.value ? '#3b82f6' : '#1f2937',
                  color: activeFilter === cat.value ? 'white' : '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor Dinámico de Tarjetas de Técnicos */}
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#e5e7eb' }}>Técnicos Especializados Disponibles</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {loadingTechs ? (
            <p style={{ color: '#9ca3af' }}>Cargando técnicos disponibles...</p>
          ) : filteredTechs.length === 0 ? (
            <p style={{ color: '#9ca3af', gridColumn: '1/-1', textAlign: 'center', padding: '30px' }}>No hay técnicos disponibles en esta categoría actualmente.</p>
          ) : (
            filteredTechs.map(tech => (
              <div 
                key={tech._id}
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <img src={tech.profilePic || 'https://via.placeholder.com/80'} alt={tech.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
                    <div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#fff' }}>{tech.name}</h3>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0' }}>Edad: {tech.age} años</p>
                      <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>Técnico Verificado</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}>Especialidades:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {tech.specialties && tech.specialties.length > 0 ? (
                        tech.specialties.map(s => (
                          <span key={s} style={{ fontSize: '11px', background: '#1f2937', border: '1px solid #374151', padding: '3px 8px', borderRadius: '4px', color: '#e5e7eb' }}>{s}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>General</span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/technician-profile?id=${tech._id}`)}
                  style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Ver Perfil y Cotizar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sección de Mi Garaje (Órdenes Activas) */}
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#e5e7eb' }}>Mi Garaje (Órdenes Activas)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {clientRequests.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>No tienes reparaciones en curso actualmente.</p>
            ) : (
              clientRequests.map(req => (
                <div key={req._id} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px' }}>#{req.requestId}</span>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', textTransform: 'uppercase' }}>{req.status}</span>
                    </div>
                    <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>{req.deviceModel}</h3>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '10px' }}>Técnico: {req.technicianId ? req.technicianId.name : 'Asignado'}</p>
                    <p style={{ fontSize: '13px', color: '#e5e7eb', marginBottom: '15px' }}>Presupuesto: <strong>{req.priceQuote ? `$${req.priceQuote.toLocaleString('es-CO')} COP` : 'Pendiente'}</strong></p>
                  </div>
                  <button 
                    onClick={() => navigate(`/repair-chat?requestId=${req._id}`)}
                    style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Abrir Chat y Seguimiento
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Widget Flotante de IA */}
      <AIChatWidget />

    </div>
  );
}