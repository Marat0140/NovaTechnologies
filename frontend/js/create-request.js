document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const technicianId = urlParams.get('technicianId');

    if (!technicianId) {
        alert('No se ha seleccionado un técnico válido.');
        window.location.href = 'client-dashboard.html';
        return;
    }

    const requestForm = document.getElementById('requestForm');
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const deviceCategory = document.getElementById('deviceCategory').value;
        const deviceModel = document.getElementById('deviceModel').value;
        const issueDescription = document.getElementById('issueDescription').value;

        try {
            const res = await fetch('http://localhost:5000/api/repairs/create', {
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
                window.location.href = 'client-dashboard.html';
            } else {
                alert(data.message || 'Error al enviar la solicitud.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar con el servidor.');
        }
    });
});