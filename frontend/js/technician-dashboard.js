document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    let allRequests = [];

    async function loadTechnicianRequests() {
        try {
            const res = await fetch('http://localhost:5000/api/repairs/technician-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                allRequests = data.requests;
                updateCounters();
                renderRequests('incoming');
            } else {
                document.getElementById('techRequestsGrid').innerHTML = `<p style="color: #ef4444;">Error al cargar las solicitudes.</p>`;
            }
        } catch (error) {
            console.error('Error de red:', error);
            document.getElementById('techRequestsGrid').innerHTML = `<p style="color: #ef4444;">No se pudo conectar con el servidor.</p>`;
        }
    }

    function updateCounters() {
        const pending = allRequests.filter(r => r.status === 'pending').length;
        const active = allRequests.filter(r => r.status !== 'pending' && r.status !== 'completed').length;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('activeCount').textContent = active;
    }

    // Pestañas (Incoming vs Active)
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.style.background = '#1f2937';
                b.style.borderColor = '#374151';
                b.style.color = '#9ca3af';
            });
            btn.style.background = '#3b82f6';
            btn.style.borderColor = '#3b82f6';
            btn.style.color = '#fff';

            const tab = btn.getAttribute('data-tab');
            renderRequests(tab);
        });
    });

    function renderRequests(tab) {
        const grid = document.getElementById('techRequestsGrid');
        
        const filtered = allRequests.filter(r => {
            if (tab === 'incoming') return r.status === 'pending';
            return r.status !== 'pending' && r.status !== 'completed';
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1/-1; text-align: center; padding: 40px;">No hay órdenes en esta sección actualmente.</p>`;
            return;
        }

        grid.innerHTML = filtered.map(req => `
            <div style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 11px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 10px; border-radius: 6px; font-weight: 600;">Orden #${req.requestId}</span>
                        <span style="font-size: 11px; color: #9ca3af;">${new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 style="font-size: 16px; color: #fff; margin-bottom: 6px;">${req.deviceModel}</h3>
                    <p style="font-size: 13px; color: #9ca3af; margin-bottom: 12px;"><strong>Categoría:</strong> ${req.deviceCategory}</p>
                    
                    <div style="background: #1f2937; padding: 12px; border-radius: 8px; border: 1px solid #374151; margin-bottom: 15px;">
                        <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">Falla reportada:</p>
                        <p style="font-size: 13px; color: #e5e7eb; margin: 0;">${req.issueDescription}</p>
                    </div>

                    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 15px;"><strong>Cliente:</strong> ${req.clientId ? req.clientId.name : 'Desconocido'}</p>
                </div>

                ${tab === 'incoming' ? `
                    <button onclick="acceptRequest('${req._id}')" style="width: 100%; background: #10b981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s;">
                        Aceptar y Cotizar Orden
                    </button>
                ` : `
                    <button onclick="window.location.href='repair-chat.html?requestId=${req._id}'" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s;">
                        Ver Detalles y Chat
                    </button>
                `}
            </div>
        `).join('');
    }

    window.acceptRequest = async function(requestId) {
        const price = prompt('Ingresa el valor del presupuesto para esta reparación (Ej: 150000):');
        if (!price) return;

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
                loadTechnicianRequests();
            } else {
                alert('Error al aceptar la solicitud.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor.');
        }
    };

    loadTechnicianRequests();
});