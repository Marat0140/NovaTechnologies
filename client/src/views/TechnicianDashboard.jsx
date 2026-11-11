import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming');
  const [loading, setLoading] = useState(true);

  // Verificar autenticación y cargar órdenes del técnico
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadTechnicianRequests(token);
  }, [navigate]);

  const loadTechnicianRequests = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/repairs/technician-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setAllRequests(data.requests);
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Aceptar y cotizar orden
  const handleAcceptRequest = async (requestId) => {
    const price = prompt('Ingresa el valor del presupuesto para esta reparación (Ej: 150000):');
    if (!price) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceQuote: Number(price) })
      });

      if (res.ok) {
        alert('¡Orden aceptada y cotizada con éxito!');
        loadTechnicianRequests(token);
      } else {
        alert('Error al aceptar la solicitud.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor.');
    }
  };

  // Contadores
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const activeCount = allRequests.filter(r => r.status !== 'pending' && r.status !== 'completed').length;

  // Filtrar según la pestaña activa
  const filteredRequests = allRequests.filter(r => {
    if (activeTab === 'incoming') return r.status === 'pending';
    return r.status !== 'pending' && r.status !== 'completed';
  });

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar del Técnico */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
          <Link to="/technician-dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <span className="brand-icon">⚡</span>
            <span className="brand-name">Nova Technologies <span style={{ fontSize: '12px', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>Técnico / Taller</span></span>
          </Link>
          
          <nav className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/technician-dashboard" className="nav-link" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Órdenes de Trabajo</Link>
            <Link to="/contact" className="nav-link" style={{ color: '#9ca3af', textDecoration: 'none' }}>Soporte</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Cerrar Sesión</button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Tarjeta de Bienvenida y Estadísticas */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '30px', borderRadius: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '6px', color: '#fff' }}>¡Hola, Maestro Técnico!</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Aquí puedes revisar las solicitudes de reparación asignadas a tus especialidades y gestionar presupuestos.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ background: '#1f2937', padding: '12px 20px', borderRadius: '10px', border: '1px solid #374151', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{pendingCount}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Pendientes</span>
            </div>
            <div style={{ background: '#1f2937', padding: '12px 20px', borderRadius: '10px', border: '1px solid #374151', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{activeCount}</span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>En Proceso</span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación de Órdenes */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px' }}>
          {[
            { label: 'Solicitudes Entrantes', tab: 'incoming' },
            { label: 'Reparaciones en Curso', tab: 'active' }
          ].map(item => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: `1px solid ${activeTab === item.tab ? '#3b82f6' : '#374151'}`,
                background: activeTab === item.tab ? '#3b82f6' : '#1f2937',
                color: activeTab === item.tab ? 'white' : '#9ca3af',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Contenedor Dinámico de Órdenes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {loading ? (
            <p style={{ color: '#9ca3af' }}>Cargando solicitudes...</p>
          ) : filteredRequests.length === 0 ? (
            <p style={{ color: '#9ca3af', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No hay órdenes en esta sección actualmente.</p>
          ) : (
            filteredRequests.map(req => (
              <div 
                key={req._id}
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>Orden #{req.requestId}</span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '6px' }}>{req.deviceModel}</h3>
                  <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}><strong>Categoría:</strong> {req.deviceCategory}</p>
                  
                  <div style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', border: '1px solid #374151', marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Falla reportada:</p>
                    <p style={{ fontSize: '13px', color: '#e5e7eb', margin: '0' }}>{req.issueDescription}</p>
                  </div>

                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}><strong>Cliente:</strong> {req.clientId ? req.clientId.name : 'Desconocido'}</p>
                </div>

                {activeTab === 'incoming' ? (
                  <button 
                    onClick={() => handleAcceptRequest(req._id)}
                    style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Aceptar y Cotizar Orden
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/repair-chat?requestId=${req._id}`)}
                    style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Ver Detalles y Chat
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </main>

    </div>
  );
}