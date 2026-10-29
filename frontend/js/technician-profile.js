document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Obtener el ID de la URL (ej: technician-profile.html?id=1234567890)
    const urlParams = new URLSearchParams(window.location.search);
    const techId = urlParams.get('id');

    if (!techId) {
        document.getElementById('profileContainer').innerHTML = `<p style="color: #ef4444; text-align: center;">No se especificó un técnico válido.</p>`;
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/technicians/${techId}`);
        const data = await res.json();

        if (res.ok) {
            renderProfile(data.technician);
        } else {
            document.getElementById('profileContainer').innerHTML = `<p style="color: #ef4444; text-align: center;">${data.message || 'No se pudo cargar el perfil.'}</p>`;
        }
    } catch (error) {
        console.error('Error de red:', error);
        document.getElementById('profileContainer').innerHTML = `<p style="color: #ef4444; text-align: center;">Error de conexión con el servidor.</p>`;
    }

    function renderProfile(tech) {
        const container = document.getElementById('profileContainer');
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; margin-bottom: 30px;">
                <img src="${tech.profilePic || 'https://via.placeholder.com/120'}" alt="${tech.name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6; margin-bottom: 20px; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                <h1 style="font-size: 26px; margin: 0 0 8px 0; color: #fff;">${tech.name}</h1>
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 12px 0;">ID Único de Técnico: <span style="color: #3b82f6; font-family: monospace; font-weight: bold;">#${tech.userId}</span></p>
                <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">✔️ Técnico Verificado y Certificado</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #1f2937; padding: 20px; border-radius: 12px; border: 1px solid #374151;">
                    <h3 style="font-size: 14px; color: #9ca3af; margin-bottom: 6px;">Edad</h3>
                    <p style="font-size: 18px; font-weight: 600; color: #fff; margin: 0;">${tech.age} años</p>
                </div>
                <div style="background: #1f2937; padding: 20px; border-radius: 12px; border: 1px solid #374151;">
                    <h3 style="font-size: 14px; color: #9ca3af; margin-bottom: 6px;">Correo de Contacto</h3>
                    <p style="font-size: 16px; font-weight: 600; color: #fff; margin: 0; word-break: break-all;">${tech.email}</p>
                </div>
            </div>

            <div style="margin-bottom: 35px;">
                <h3 style="font-size: 16px; color: #e5e7eb; margin-bottom: 12px;">Especialidades de Reparación</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${tech.specialties && tech.specialties.length > 0 
                        ? tech.specialties.map(s => `<span style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.4); padding: 8px 16px; border-radius: 8px; color: #60a5fa; font-size: 14px; font-weight: 500;">🔧 ${s}</span>`).join('') 
                        : '<span style="color: #6b7280;">Sin especialidades registradas.</span>'}
                </div>
            </div>

            <button onclick="window.location.href='create-request.html?technicianId=${tech._id}'" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 15px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                ⚡ Cotizar Reparación con este Técnico
            </button>
        `;
    }
});