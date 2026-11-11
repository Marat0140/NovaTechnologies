document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Cargar Estadísticas
    async function loadStats() {
        try {
            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById('statUsers').textContent = data.totalUsers;
                document.getElementById('statTechs').textContent = data.totalTechnicians;
                document.getElementById('statOrders').textContent = data.totalOrders;
                document.getElementById('statTickets').textContent = data.pendingTickets;
            } else if (res.status === 403) {
                alert('Acceso restringido solo para administradores.');
                window.location.href = 'client-dashboard.html';
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Cargar Usuarios
    async function loadUsers() {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const tbody = document.getElementById('usersTableBody');
                tbody.innerHTML = data.users.map(u => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px; font-family: monospace; color: #3b82f6;">#${u.userId || 'N/A'}</td>
                        <td style="padding: 12px; font-weight: 500;">${u.name}</td>
                        <td style="padding: 12px; color: #9ca3af;">${u.email}</td>
                        <td style="padding: 12px;"><span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: ${u.role === 'technician' ? '#10b98122' : (u.role === 'admin' ? '#ef444422' : '#3b82f622')}; color: ${u.role === 'technician' ? '#10b981' : (u.role === 'admin' ? '#ef4444' : '#3b82f6')};">${u.role.toUpperCase()}</span></td>
                        <td style="padding: 12px; color: #9ca3af;">${u.age ? u.age + ' años' : '-'}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Cargar Tickets
    async function loadTickets() {
        try {
            const res = await fetch('http://localhost:5000/api/admin/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const container = document.getElementById('ticketsContainer');
                if (data.tickets.length === 0) {
                    container.innerHTML = `<p style="color: #9ca3af;">No hay mensajes de soporte en la bandeja.</p>`;
                    return;
                }
                container.innerHTML = data.tickets.map(t => `
                    <div style="background: #1f2937; border: 1px solid #374151; padding: 18px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <h4 style="font-size: 15px; margin: 0; color: #fff;">${t.subject}</h4>
                            <span style="font-size: 11px; padding: 3px 8px; border-radius: 6px; background: ${t.status === 'resolved' ? '#10b98122' : '#ef444422'}; color: ${t.status === 'resolved' ? '#10b981' : '#ef4444'};">${t.status.toUpperCase()}</span>
                        </div>
                        <p style="font-size: 13px; color: #9ca3af; margin-bottom: 8px;"><strong>Remitente:</strong> ${t.name} (${t.email})</p>
                        <p style="font-size: 13px; color: #e5e7eb; background: #111827; padding: 12px; border-radius: 6px; margin-bottom: 10px;">${t.message}</p>
                        ${t.status === 'pending' ? `<button onclick="resolveTicket('${t._id}')" style="background: #10b981; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;">Marcar como Resuelto</button>` : ''}
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error(error);
        }
    }

    window.resolveTicket = async (ticketId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/tickets/${ticketId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'resolved' })
            });
            if (res.ok) {
                loadTickets();
                loadStats();
            }
        } catch (error) { console.error(error); }
    };

    // Alternar pestañas
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.style.background = '#1f2937';
                t.style.borderColor = '#374151';
                t.style.color = '#9ca3af';
            });
            tab.style.background = '#3b82f6';
            tab.style.borderColor = '#3b82f6';
            tab.style.color = '#fff';

            const selected = tab.getAttribute('data-tab');
            document.getElementById('usersSection').style.display = selected === 'users' ? 'block' : 'none';
            document.getElementById('ticketsSection').style.display = selected === 'tickets' ? 'block' : 'none';
            document.getElementById('ordersSection').style.display = selected === 'orders' ? 'block' : 'none';
        });
    });

    async function loadOrders() {
    try {
        const res = await fetch('http://localhost:5000/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            const tbody = document.getElementById('ordersTableBody');
            if (data.orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="padding: 20px; text-align: center; color: #9ca3af;">No hay órdenes registradas en el sistema.</td></tr>`;
                return;
            }
            tbody.innerHTML = data.orders.map(o => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px; font-family: monospace; color: #3b82f6;">#${o.requestId}</td>
                    <td style="padding: 12px; font-weight: 500;">${o.deviceModel} <span style="font-size: 11px; color: #9ca3af; display: block;">${o.deviceCategory}</span></td>
                    <td style="padding: 12px; color: #e5e7eb;">${o.clientId ? o.clientId.name : 'N/A'}</td>
                    <td style="padding: 12px; color: #e5e7eb;">${o.technicianId ? o.technicianId.name : 'Sin asignar'}</td>
                    <td style="padding: 12px;"><span style="font-size: 11px; padding: 2px 8px; border-radius: 6px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; text-transform: uppercase;">${o.status}</span></td>
                    <td style="padding: 12px; color: #10b981; font-weight: 600;">${o.priceQuote ? '$' + o.priceQuote.toLocaleString('es-CO') : 'Pendiente'}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error cargando órdenes globales:', error);
    }
}
    loadOrders();
    loadStats();
    loadUsers();
    loadTickets();
});