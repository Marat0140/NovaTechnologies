import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function TechnicianProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const techId = searchParams.get('id');

  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar autenticación y cargar el perfil del técnico
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!techId) {
      setErrorMessage('No se especificó un técnico válido.');
      setLoading(false);
      return;
    }

    fetchTechnicianProfile(techId);
  }, [techId, navigate]);

  const fetchTechnicianProfile = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/technicians/${id}`);
      const data = await res.json();

      if (res.ok) {
        setTechnician(data.technician);
      } else {
        setErrorMessage(data.message || 'No se pudo cargar el perfil.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
          <Link to="/client-dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <span className="brand-icon">⚡</span>
            <span className="brand-name">Nova Technologies</span>
          </Link>
          <nav className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/client-dashboard" className="nav-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Volver al Panel</Link>
          </nav>
        </div>
      </header>

      {/* Contenido Principal del Perfil */}
      <main style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div id="profileContainer" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af' }}>Cargando perfil del técnico...</p>
          ) : errorMessage ? (
            <p style={{ color: '#ef4444', textAlign: 'center' }}>{errorMessage}</p>
          ) : technician ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px', marginBottom: '30px' }}>
                <img 
                  src={technician.profilePic || 'https://via.placeholder.com/120'} 
                  alt={technician.name} 
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6', marginBottom: '20px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }} 
                />
                <h1 style={{ fontSize: '26px', margin: '0 0 8px 0', color: '#fff' }}>{technician.name}</h1>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 12px 0' }}>
                  ID Único de Técnico: <span style={{ color: '#3b82f6', fontFamily: 'monospace', fontWeight: 'bold' }}>#{technician.userId}</span>
                </p>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  ✔️ Técnico Verificado y Certificado
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid #374151' }}>
                  <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '6px' }}>Edad</h3>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0' }}>{technician.age} años</p>
                </div>
                <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid #374151' }}>
                  <h3 style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '6px' }}>Correo de Contacto</h3>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0', wordBreak: 'break-all' }}>{technician.email}</p>
                </div>
              </div>

              <div style={{ marginBottom: '35px' }}>
                <h3 style={{ fontSize: '16px', color: '#e5e7eb', marginBottom: '12px' }}>Especialidades de Reparación</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {technician.specialties && technician.specialties.length > 0 ? (
                    technician.specialties.map(s => (
                      <span key={s} style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '8px 16px', borderRadius: '8px', color: '#60a5fa', fontSize: '14px', fontWeight: '500' }}>
                        🔧 {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#6b7280' }}>Sin especialidades registradas.</span>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate(`/create-request?technicianId=${technician._id}`)}
                style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                ⚡ Cotizar Reparación con este Técnico
              </button>
            </>
          ) : null}

        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        &copy; 2026 Nova Technologies. Todos los derechos reservados.
      </footer>

    </div>
  );
}