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

    // Control del Widget de IA flotante
    const aiToggleBtn = document.getElementById('aiToggleBtn');
    const aiChatPopup = document.getElementById('aiChatPopup');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    
    if (aiToggleBtn) {
        aiToggleBtn.addEventListener('click', () => {
            aiChatPopup.style.display = aiChatPopup.style.display === 'none' ? 'block' : 'none';
        });
    }
    if (aiCloseBtn) {
        aiCloseBtn.addEventListener('click', () => {
            aiChatPopup.style.display = 'none';
        });
    }

    // Cargar técnicos desde el backend
    let allTechnicians = [];
    try {
        const res = await fetch('http://localhost:5000/api/technicians');
        const data = await res.json();
        if (res.ok) {
            allTechnicians = data.technicians;
            renderTechnicians(allTechnicians);
        } else {
            document.getElementById('techniciansGrid').innerHTML = `<p style="color: #ef4444;">Error al cargar técnicos.</p>`;
        }
    } catch (error) {
        console.error('Error de red:', error);
        document.getElementById('techniciansGrid').innerHTML = `<p style="color: #ef4444;">No se pudo conectar con el servidor.</p>`;
    }

    // Filtrar técnicos por especialidad
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.style.background = '#1f2937';
                b.style.borderColor = '#374151';
                b.style.color = '#9ca3af';
            });
            btn.style.background = '#3b82f6';
            btn.style.borderColor = '#3b82f6';
            btn.style.color = '#fff';

            const specialty = btn.getAttribute('data-specialty');
            if (specialty === 'all') {
                renderTechnicians(allTechnicians);
            } else {
                const filtered = allTechnicians.filter(tech => tech.specialties && tech.specialties.includes(specialty));
                renderTechnicians(filtered);
            }
        });
    });

    // Función para pintar las tarjetas de los técnicos
    function renderTechnicians(techs) {
        const grid = document.getElementById('techniciansGrid');
        if (techs.length === 0) {
            grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1/-1; text-align: center; padding: 30px;">No hay técnicos disponibles en esta categoría actualmente.</p>`;
            return;
        }

        grid.innerHTML = techs.map(tech => `
            <div class="tech-card" data-id="${tech._id}" style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; justify-content: space-between;" onmouseover="this.style.borderColor='#3b82f6'; this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='translateY(0)'">
                <div>
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <img src="${tech.profilePic || 'https://via.placeholder.com/80'}" alt="${tech.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6;">
                        <div>
                            <h3 style="font-size: 16px; margin: 0 0 4px 0; color: #fff;">${tech.name}</h3>
                            <p style="font-size: 13px; color: #9ca3af; margin: 0;">Edad: ${tech.age} años</p>
                            <span style="font-size: 11px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-top: 4px;">Técnico Verificado</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <p style="font-size: 12px; color: #9ca3af; margin-bottom: 5px;">Especialidades:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${tech.specialties && tech.specialties.length > 0 
                                ? tech.specialties.map(s => `<span style="font-size: 11px; background: #1f2937; border: 1px solid #374151; padding: 3px 8px; border-radius: 4px; color: #e5e7eb;">${s}</span>`).join('') 
                                : '<span style="font-size: 11px; color: #6b7280;">General</span>'}
                        </div>
                    </div>
                </div>
                <button onclick="window.location.href='technician-profile.html?id=${tech._id}'" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: 0.2s;">Ver Perfil y Cotizar</button>
            </div>
        `).join('');
    }

    // Cargar el Garaje / Órdenes del Cliente
    async function loadClientRequests() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/repairs/my-requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                renderClientRequests(data.requests);
            }
        } catch (error) {
            console.error('Error cargando garaje:', error);
        }
    }

    function renderClientRequests(requests) {
        // Buscamos o creamos un contenedor para "Mi Garaje" en el dashboard
        let garageContainer = document.getElementById('clientGarageSection');
        if (!garageContainer) {
            garageContainer = document.createElement('div');
            garageContainer.id = 'clientGarageSection';
            garageContainer.style.cssText = 'margin-top: 40px;';
            garageContainer.innerHTML = `
                <h2 style="font-size: 18px; margin-bottom: 15px; color: #e5e7eb;">Mi Garaje (Órdenes Activas)</h2>
                <div id="garageGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;"></div>
            `;
            document.querySelector('main').appendChild(garageContainer);
        }

        const grid = document.getElementById('garageGrid');
        if (requests.length === 0) {
            grid.innerHTML = `<p style="color: #9ca3af; font-size: 13px;">No tienes reparaciones en curso actualmente.</p>`;
            return;
        }

        grid.innerHTML = requests.map(req => `
            <div style="background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 11px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 3px 8px; border-radius: 6px;">#${req.requestId}</span>
                        <span style="font-size: 11px; color: #10b981; font-weight: 600; text-transform: uppercase;">${req.status}</span>
                    </div>
                    <h3 style="font-size: 16px; color: #fff; margin-bottom: 4px;">${req.deviceModel}</h3>
                    <p style="font-size: 13px; color: #9ca3af; margin-bottom: 10px;">Técnico: ${req.technicianId ? req.technicianId.name : 'Asignado'}</p>
                    <p style="font-size: 13px; color: #e5e7eb; margin-bottom: 15px;">Presupuesto: <strong>${req.priceQuote ? `$${req.priceQuote.toLocaleString('es-CO')} COP` : 'Pendiente'}</strong></p>
                </div>
                <button onclick="window.location.href='repair-chat.html?requestId=${req._id}'" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 500; cursor: pointer;">
                    Abrir Chat y Seguimiento
                </button>
            </div>
        `).join('');
    }

    // Ejecutar al cargar la página del cliente
    loadClientRequests();
});