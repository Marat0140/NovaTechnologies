import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalTechnicians: 0, totalOrders: 0, pendingTickets: 0 });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Verificar token y rol de administrador al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAllAdminData(token);
  }, [navigate]);

  const fetchAllAdminData = async (token) => {
    try {
      // 1. Estadísticas
      const resStats = await fetch('https://proyecto-avanzado-jc.onrender.com/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStats = await resStats.json();
      if (resStats.status === 403) {
        alert('Acceso restringido solo para administradores.');
        navigate('/client-dashboard');
        return;
      }
      if (resStats.ok) setStats(dataStats);

      // 2. Usuarios
      const resUsers = await fetch('https://proyecto-avanzado-jc.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataUsers = await resUsers.json();
      if (resUsers.ok) setUsers(dataUsers.users);

      // 3. Órdenes Globales
      const resOrders = await fetch('https://proyecto-avanzado-jc.onrender.com/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataOrders = await resOrders.json();
      if (resOrders.ok) setOrders(dataOrders.orders);

      // 4. Tickets de Soporte
      const resTickets = await fetch('https://proyecto-avanzado-jc.onrender.com/api/admin/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataTickets = await resTickets.json();
      if (resTickets.ok) setTickets(dataTickets.tickets);

    } catch (error) {
      console.error('Error cargando datos de administrador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Marcar ticket como resuelto
  const handleResolveTicket = async (ticketId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://proyecto-avanzado-jc.onrender.com/api/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        fetchAllAdminData(token);
      }
    } catch (error) {
      console.error('Error resolviendo ticket:', error);
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar del Administrador */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)', height: '70px', display: 'flex', alignItems: 'center' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Link to="/admin-dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <img src={logoImg} alt="Nova Technologies" style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} />
            <span className="brand-name">Nova Technologies <span style={{ fontSize: '12px', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', marginLeft: '5px' }}>Administrador</span></span>
          </Link>

          <nav className="navbar-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Cerrar Sesión</button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Tarjetas de Estadísticas Globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Total Usuarios</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalUsers}</span>
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Técnicos Registrados</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981' }}>{stats.totalTechnicians}</span>
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Órdenes de Reparación</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.totalOrders}</span>
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block' }}>Tickets Pendientes</span>
            <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#ef4444' }}>{stats.pendingTickets}</span>
          </div>
        </div>

        {/* Pestañas de Gestión */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px' }}>
          {[
            { label: 'Gestión de Usuarios', tab: 'users' },
            { label: 'Solicitudes de Soporte', tab: 'tickets' },
            { label: 'Órdenes Globales', tab: 'orders' }
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

        {/* Vista de Usuarios */}
        {activeTab === 'users' && (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '25px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>Usuarios Registrados en Atlas</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    <th style={{ padding: '12px' }}>ID Único</th>
                    <th style={{ padding: '12px' }}>Nombre</th>
                    <th style={{ padding: '12px' }}>Correo</th>
                    <th style={{ padding: '12px' }}>Rol</th>
                    <th style={{ padding: '12px' }}>Edad</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Cargando usuarios...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No hay usuarios registrados.</td></tr>
                  ) : (
                    users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#3b82f6' }}>#{u.userId || 'N/A'}</td>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#fff' }}>{u.name}</td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: u.role === 'technician' ? '#10b98122' : (u.role === 'admin' ? '#ef444422' : '#3b82f622'), color: u.role === 'technician' ? '#10b981' : (u.role === 'admin' ? '#ef4444' : '#3b82f6') }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>{u.age ? u.age + ' años' : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vista de Órdenes Globales */}
        {activeTab === 'orders' && (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '25px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>Supervisión de Todas las Órdenes</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                    <th style={{ padding: '12px' }}>ID Orden</th>
                    <th style={{ padding: '12px' }}>Dispositivo</th>
                    <th style={{ padding: '12px' }}>Cliente</th>
                    <th style={{ padding: '12px' }}>Técnico</th>
                    <th style={{ padding: '12px' }}>Estado</th>
                    <th style={{ padding: '12px' }}>Presupuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Cargando órdenes...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No hay órdenes registradas en el sistema.</td></tr>
                  ) : (
                    orders.map(o => (
                      <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#3b82f6' }}>#{o.requestId}</td>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#fff' }}>
                          {o.deviceModel} 
                          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>{o.deviceCategory}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#e5e7eb' }}>{o.clientId ? o.clientId.name : 'N/A'}</td>
                        <td style={{ padding: '12px', color: '#e5e7eb' }}>{o.technicianId ? o.technicianId.name : 'Sin asignar'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', textTransform: 'uppercase' }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#10b981', fontWeight: '600' }}>
                          {o.priceQuote ? '$' + o.priceQuote.toLocaleString('es-CO') : 'Pendiente'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vista de Tickets de Soporte */}
        {activeTab === 'tickets' && (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '25px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#fff' }}>Bandeja de Mensajes de Soporte</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Cargando mensajes...</p>
              ) : tickets.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>No hay mensajes de soporte en la bandeja.</p>
              ) : (
                tickets.map(t => (
                  <div key={t._id} style={{ background: '#1f2937', border: '1px solid #374151', padding: '18px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '15px', margin: 0, color: '#fff' }}>{t.subject}</h4>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: t.status === 'resolved' ? '#10b98122' : '#ef444422', color: t.status === 'resolved' ? '#10b981' : '#ef4444' }}>
                        {t.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}><strong>Remitente:</strong> {t.name} ({t.email})</p>
                    <p style={{ fontSize: '13px', color: '#e5e7eb', background: '#111827', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>{t.message}</p>
                    {t.status === 'pending' && (
                      <button onClick={() => handleResolveTicket(t._id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                        Marcar como Resuelto
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}