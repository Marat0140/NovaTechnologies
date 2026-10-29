document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');

    if (!requestId) {
        alert('ID de orden no especificado.');
        window.location.href = 'client-dashboard.html';
        return;
    }

    document.getElementById('backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });

    let currentUserId = '';
    let userRole = '';
    let currentRequest = null;

    // Obtener detalles de la orden y mensajes
    async function fetchChatData() {
        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                currentUserId = data.currentUserId;
                currentRequest = data.request;
                
                // Determinamos el rol del usuario actual
                userRole = currentRequest.clientId._id === currentUserId ? 'client' : 'technician';

                renderOrderDetails(currentRequest);
                renderInteractivePanel(currentRequest);
                renderMessages(currentRequest.chatMessages);
            }
        } catch (error) {
            console.error('Error cargando el chat:', error);
        }
    }

    function renderOrderDetails(req) {
        document.getElementById('chatOrderTitle').textContent = `Orden #${req.requestId}`;
        document.getElementById('deviceModelText').textContent = req.deviceModel;
        document.getElementById('issueText').textContent = `Falla: ${req.issueDescription}`;
        document.getElementById('chatStatusBadge').textContent = req.status.toUpperCase();
        
        if (req.priceQuote && req.priceQuote > 0) {
            document.getElementById('priceText').textContent = `$${req.priceQuote.toLocaleString('es-CO')} COP`;
        } else {
            document.getElementById('priceText').textContent = 'Pendiente de cotización';
        }
    }

    // Panel interactivo de acciones comerciales y de OTP
    function renderInteractivePanel(req) {
        const panel = document.getElementById('interactiveActionPanel');
        panel.style.display = 'none';
        panel.innerHTML = '';

        // 1. CLIENTE: Cotización inicial disponible para Aceptar o Rechazar
        if (userRole === 'client' && req.status === 'quoted') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #fbbf24;">⚡ El técnico ha cotizado esta reparación en <strong>$${req.priceQuote.toLocaleString('es-CO')} COP</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button onclick="respondQuote('accept')" style="flex: 1; background: #10b981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">Aceptar Presupuesto</button>
                    <button onclick="respondQuote('reject')" style="flex: 1; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">Rechazar (Pagar Revisión)</button>
                </div>
            `;
        }

        // 2. TÉCNICO: Ofrecer Re-cotización o solicitar OTP de Entrega durante la reparación
        if (userRole === 'technician' && req.status === 'in_repair') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: space-between; flex-wrap: wrap;">
                    <button onclick="proposeNewPrice()" style="background: #f59e0b; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 600; cursor: pointer;">Proponer Cambio de Precio</button>
                    <button onclick="requestCompletionOtp()" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 600; cursor: pointer;">Finalizar y Pedir OTP al Cliente</button>
                </div>
            `;
        }

        // 3. CLIENTE: Propuesta de cambio de precio pendiente
        if (userRole === 'client' && req.priceModification && req.priceModification.status === 'pending') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #f59e0b;">⚠️ El técnico propone actualizar el precio a: <strong>$${req.priceModification.newPrice.toLocaleString('es-CO')} COP</strong>.</p>
                <div style="display: flex; gap: 10px;">
                    <button onclick="respondPriceMod('accept')" style="flex: 1; background: #10b981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">Aceptar Nuevo Precio</button>
                    <button onclick="respondPriceMod('reject')" style="flex: 1; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;">Rechazar (Pagar Revisión)</button>
                </div>
            `;
        }

        // 4. CLIENTE: Muestra su código OTP de entrega final cuando esté listo
        if (userRole === 'client' && req.completionOtp && req.status !== 'completed') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <div style="text-align: center;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #10b981;">¡Tu equipo está listo! Dicta este código OTP al técnico al recogerlo:</p>
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #3b82f6; font-family: monospace;">${req.completionOtp}</span>
                </div>
            `;
        }

        // 5. TÉCNICO: Ingresar código OTP entregado por el cliente
        if (userRole === 'technician' && req.completionOtp && req.status !== 'completed') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="otpInput" placeholder="Ingresa OTP de 6 dígitos" style="flex: 1; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 8px; color: #fff; font-family: monospace; text-align: center; font-size: 16px;">
                    <button onclick="completeOrderWithOtp()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">Entregar y Completar</button>
                </div>
            `;
        }

        // 6. TÉCNICO: Validar código OTP de cancelación (Revisión pagada)
        if (userRole === 'technician' && req.status === 'pending_cancellation') {
            panel.style.display = 'block';
            panel.innerHTML = `
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #ef4444;">El cliente canceló la orden. Ingresa el OTP de cancelación tras recibir el pago de revisión (${req.cancellationOtp}):</p>
                <div style="display: flex; gap: 10px;">
                    <input type="text" id="cancelOtpInput" placeholder="OTP de Cancelación" style="flex: 1; padding: 10px; background: #111827; border: 1px solid #374151; border-radius: 8px; color: #fff; text-align: center;">
                    <button onclick="confirmCancellationOtp()" style="background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 600; cursor: pointer;">Confirmar Cancelación</button>
                </div>
            `;
        }
    }

    function renderMessages(messages) {
        const box = document.getElementById('messagesBox');
        if (!messages || messages.length === 0) {
            box.innerHTML = `<p style="text-align: center; color: #6b7280; font-size: 13px;">No hay mensajes aún. Inicia la conversación.</p>`;
            return;
        }

        box.innerHTML = messages.map(msg => {
            const isMine = msg.senderId === currentUserId;
            return `
                <div style="align-self: ${isMine ? 'flex-end' : 'flex-start'}; max-width: 70%; background: ${isMine ? '#3b82f6' : '#1f2937'}; color: #fff; padding: 10px 14px; border-radius: 12px; font-size: 14px; border: 1px solid ${isMine ? '#2563eb' : '#374151'};">
                    <span style="font-size: 10px; opacity: 0.7; display: block; margin-bottom: 2px;">${msg.senderRole === 'technician' ? '🔧 Técnico' : '👤 Cliente'}</span>
                    <p style="margin: 0; word-break: break-word;">${msg.message}</p>
                    <span style="font-size: 9px; opacity: 0.5; display: block; text-align: right; margin-top: 4px;">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            `;
        }).join('');

        box.scrollTop = box.scrollHeight;
    }

    // Funciones Globales para botones de acción
    window.respondQuote = async (action) => {
        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/respond-quote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            alert(data.message);
            fetchChatData();
        } catch (error) {
            console.error(error);
        }
    };

    window.proposeNewPrice = async () => {
        const newPrice = prompt('Ingresa el nuevo valor del presupuesto para esta reparación:');
        if (!newPrice) return;

        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/propose-price`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ newPrice: Number(newPrice) })
            });
            const data = await res.json();
            alert(data.message);
            fetchChatData();
        } catch (error) {
            console.error(error);
        }
    };

    window.respondPriceMod = async (action) => {
        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/respond-price-mod`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            alert(data.message);
            fetchChatData();
        } catch (error) {
            console.error(error);
        }
    };

    window.requestCompletionOtp = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/request-completion-otp`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            alert('¡Código OTP generado y enviado al panel del cliente!');
            fetchChatData();
        } catch (error) {
            console.error(error);
        }
    };

    window.completeOrderWithOtp = async () => {
        const otp = document.getElementById('otpInput').value.trim();
        if (!otp) return alert('Por favor ingresa el código OTP dictado por el cliente.');

        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp })
            });
            const data = await res.json();
            if (res.ok) {
                alert('¡Reparación completada y entregada con éxito!');
                fetchChatData();
            } else {
                alert(data.message || 'OTP incorrecto.');
            }
        } catch (error) {
            console.error(error);
        }
    };

    window.confirmCancellationOtp = async () => {
        const otp = document.getElementById('cancelOtpInput').value.trim();
        if (!otp) return alert('Ingresa el OTP de cancelación.');

        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/confirm-cancellation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Orden cancelada tras confirmar pago de revisión.');
                fetchChatData();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Envío de mensajes del chat
    const chatForm = document.getElementById('chatForm');
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message) return;

        try {
            const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });

            if (res.ok) {
                input.value = '';
                fetchChatData();
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    });

    fetchChatData();
    setInterval(fetchChatData, 3000);
});