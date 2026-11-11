import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RepairChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');

  const [currentUserId, setCurrentUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [cancelOtpValue, setCancelOtpValue] = useState('');

  const messagesEndRef = useRef(null);

  // Verificar autenticación y validar requestId
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!requestId) {
      alert('ID de orden no especificado.');
      navigate('/client-dashboard');
      return;
    }

    fetchChatData(token);

    // Intervalo de actualización en tiempo real (cada 3 segundos)
    const interval = setInterval(() => {
      fetchChatData(token, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId, navigate]);

  // Hacer scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChatData = async (tokenOverride, isBackground = false) => {
    const token = tokenOverride || localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setCurrentUserId(data.currentUserId);
        const req = data.request;
        setCurrentRequest(req);
        setUserRole(req.clientId._id === data.currentUserId ? 'client' : 'technician');
        setMessages(req.chatMessages || []);
      }
    } catch (error) {
      if (!isBackground) console.error('Error cargando el chat:', error);
    }
  };

  // Enviar mensaje de texto
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        fetchChatData(token);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  // Acciones de Presupuesto y OTP
  const handleAction = async (endpoint, bodyData = {}) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${requestId}/${endpoint}`, {
        method: endpoint === 'request-completion-otp' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: Object.keys(bodyData).length > 0 ? JSON.stringify(bodyData) : undefined
      });
      const data = await res.json();
      alert(data.message || 'Acción realizada con éxito');
      fetchChatData(token);
    } catch (error) {
      console.error('Error en acción:', error);
    }
  };

  const handleProposePrice = async () => {
    const newPrice = prompt('Ingresa el nuevo valor del presupuesto para esta reparación:');
    if (!newPrice) return;
    handleAction('propose-price', { newPrice: Number(newPrice) });
  };

  const handleCompleteOrder = async () => {
    if (!otpValue.trim()) return alert('Por favor ingresa el código OTP dictado por el cliente.');
    handleAction('complete', { otp: otpValue.trim() });
  };

  const handleConfirmCancellation = async () => {
    if (!cancelOtpValue.trim()) return alert('Ingresa el OTP de cancelación.');
    handleAction('confirm-cancellation', { otp: cancelOtpValue.trim() });
  };

  const isLocked = currentRequest && (currentRequest.status === 'completed' || currentRequest.status === 'cancelled');

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <header className="navbar" style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '15px 20px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>
            ← Volver al Panel
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>
            {currentRequest ? `Orden #${currentRequest.requestId}` : 'Cargando Orden...'}
          </span>
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: '#1f2937', color: '#fff' }}>
            {currentRequest ? currentRequest.status.toUpperCase() : '-'}
          </span>
        </div>
      </header>

      {/* Contenedor Principal del Chat */}
      <main style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '20px auto', padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Tarjeta Informativa de la Orden */}
        {currentRequest && (
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px 20px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#fff' }}>{currentRequest.deviceModel}</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0' }}>Falla: {currentRequest.issueDescription}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Presupuesto:</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: '0' }}>
                {currentRequest.priceQuote && currentRequest.priceQuote > 0 
                  ? `$${currentRequest.priceQuote.toLocaleString('es-CO')} COP` 
                  : 'Pendiente'}
              </p>
            </div>
          </div>
        )}

        {/* Panel Interactivo Dinámico */}
        {currentRequest && !isLocked && (
          <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '15px', marginBottom: '15px' }}>
            
            {/* 1. CLIENTE: Cotización inicial */}
            {userRole === 'client' && currentRequest.status === 'quoted' && (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fbbf24' }}>
                  ⚡ El técnico ha cotizado esta reparación en <strong>${currentRequest.priceQuote.toLocaleString('es-CO')} COP</strong>.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAction('respond-quote', { action: 'accept' })} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Aceptar Presupuesto</button>
                  <button onClick={() => handleAction('respond-quote', { action: 'reject' })} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Rechazar (Pagar Revisión)</button>
                </div>
              </div>
            )}

            {/* 2. TÉCNICO: Opciones en reparación */}
            {userRole === 'technician' && currentRequest.status === 'in_repair' && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <button onClick={handleProposePrice} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Proponer Cambio de Precio</button>
                <button onClick={() => handleAction('request-completion-otp')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Finalizar y Pedir OTP al Cliente</button>
              </div>
            )}

            {/* 3. CLIENTE: Propuesta de cambio de precio */}
            {userRole === 'client' && currentRequest.priceModification && currentRequest.priceModification.status === 'pending' && (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#f59e0b' }}>
                  ⚠️ El técnico propone actualizar el precio a: <strong>${currentRequest.priceModification.newPrice.toLocaleString('es-CO')} COP</strong>.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleAction('respond-price-mod', { action: 'accept' })} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Aceptar Nuevo Precio</button>
                  <button onClick={() => handleAction('respond-price-mod', { action: 'reject' })} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Rechazar (Pagar Revisión)</button>
                </div>
              </div>
            )}

            {/* 4. CLIENTE: Ver OTP de entrega */}
            {userRole === 'client' && currentRequest.completionOtp && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#10b981' }}>¡Tu equipo está listo! Dicta este código OTP al técnico al recogerlo:</p>
                <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px', color: '#3b82f6', fontFamily: 'monospace' }}>{currentRequest.completionOtp}</span>
              </div>
            )}

            {/* 5. TÉCNICO: Ingresar OTP de finalización */}
            {userRole === 'technician' && currentRequest.completionOtp && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={otpValue} 
                  onChange={(e) => setOtpValue(e.target.value)} 
                  placeholder="Ingresa OTP de 6 dígitos" 
                  style={{ flex: 1, padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontFamily: 'monospace', textAlign: 'center', fontSize: '16px' }} 
                />
                <button onClick={handleCompleteOrder} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Entregar y Completar</button>
              </div>
            )}

            {/* 6. TÉCNICO: Validar OTP de cancelación */}
            {userRole === 'technician' && currentRequest.status === 'pending_cancellation' && (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ef4444' }}>El cliente canceló la orden. Ingresa el OTP de cancelación tras recibir el pago de revisión ({currentRequest.cancellationOtp}):</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={cancelOtpValue} 
                    onChange={(e) => setCancelOtpValue(e.target.value)} 
                    placeholder="OTP de Cancelación" 
                    style={{ flex: 1, padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', textAlign: 'center' }} 
                  />
                  <button onClick={handleConfirmCancellation} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Confirmar Cancelación</button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Caja de Mensajes */}
        <div style={{ flex: 1, minHeight: '350px', maxHeight: '480px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>No hay mensajes aún. Inicia la conversación.</p>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div 
                  key={index} 
                  style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%', background: isMine ? '#3b82f6' : '#1f2937', color: '#fff', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', border: `1px solid ${isMine ? '#2563eb' : '#374151'}` }}
                >
                  <span style={{ fontSize: '10px', opacity: 0.7, display: 'block', marginBottom: '2px' }}>
                    {msg.senderRole === 'technician' ? '🔧 Técnico' : '👤 Cliente'}
                  </span>
                  <p style={{ margin: 0, wordBreak: 'break-word' }}>{msg.message}</p>
                  <span style={{ fontSize: '9px', opacity: 0.5, display: 'block', textAlign: 'right', marginTop: '4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de Envío de Mensaje */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder={isLocked ? `Esta orden ya ha sido ${currentRequest?.status}. Chat bloqueado.` : 'Escribe un mensaje...'} 
            disabled={isLocked}
            style={{ flex: 1, background: '#1f2937', border: '1px solid #374151', padding: '14px', borderRadius: '10px', color: '#fff', fontSize: '14px', opacity: isLocked ? 0.5 : 1 }} 
            required={!isLocked}
          />
          <button 
            type="submit" 
            disabled={isLocked}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', borderRadius: '10px', fontWeight: '600', cursor: isLocked ? 'not-allowed' : 'pointer', transition: '0.2s', opacity: isLocked ? 0.5 : 1 }}
          >
            Enviar
          </button>
        </form>

      </main>

    </div>
  );
}