import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function CreateRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const technicianId = searchParams.get('technicianId');

  const [deviceCategory, setDeviceCategory] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar autenticación y validar technicianId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!technicianId) {
      alert('No se ha seleccionado un técnico válido.');
      navigate('/client-dashboard');
    }
  }, [technicianId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    setLoading(true);
    try {
      const res = await fetch('https://proyecto-avanzado-jc.onrender.com/api/repairs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          technicianId,
          deviceCategory,
          deviceModel,
          issueDescription
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Solicitud enviada con éxito!');
        navigate('/client-dashboard');
      } else {
        alert(data.message || 'Error al enviar la solicitud.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
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
          <nav className="navbar-links">
            <Link to="/client-dashboard" className="nav-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>← Volver al Panel</Link>
          </nav>
        </div>
      </header>

      {/* Formulario de Solicitud */}
      <main style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '35px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: '22px', marginBottom: '8px', color: '#fff' }}>⚡ Solicitar Cotización de Reparación</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '25px' }}>Llena los datos del equipo para que el técnico revise la falla y te responda por el chat.</p>

          <form onSubmit={handleSubmit}>
            {/* Categoría */}
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Categoría del Dispositivo</label>
              <select 
                value={deviceCategory} 
                onChange={(e) => setDeviceCategory(e.target.value)} 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' }} 
                required
              >
                <option value="">Selecciona una opción...</option>
                <option value="Celulares y Tablets">📱 Celulares y Tablets</option>
                <option value="Consolas y Controles">🎮 Consolas y Controles</option>
                <option value="Computadoras y Laptops">💻 Computadoras y Laptops</option>
              </select>
            </div>

            {/* Modelo */}
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Marca y Modelo del Equipo</label>
              <input 
                type="text" 
                value={deviceModel} 
                onChange={(e) => setDeviceModel(e.target.value)} 
                placeholder="Ej: PlayStation 5 / iPhone 13 Pro / Asus ROG" 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px' }} 
                required 
              />
            </div>

            {/* Descripción de la Falla */}
            <div style={{ marginBottom: '18px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>Descripción de la Falla</label>
              <textarea 
                value={issueDescription} 
                onChange={(e) => setIssueDescription(e.target.value)} 
                rows="4" 
                placeholder="Describe lo que le sucede al equipo (ej: no enciende, pantalla rota, fallo de lectura)..." 
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'vertical' }} 
                required
              ></textarea>
            </div>

            {/* Botón Enviar */}
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud al Técnico'}
            </button>
          </form>
        </div>
      </main>

    </div>
  );
}