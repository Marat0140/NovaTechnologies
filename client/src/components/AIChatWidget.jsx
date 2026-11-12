import React, { useState, useRef, useEffect } from 'react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '¡Hola! Soy el asistente técnico de Nova Technologies. Cuéntame, ¿qué equipo tienes y qué falla presenta?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  {isOpen && (
  <div 
    className="ai-chat-window"
    style={{ position: 'absolute', bottom: '75px', right: 0, width: '330px', background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}
  >
    {/* ... resto del chat ... */}
  </div>
)}

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply || 'Por favor registra una solicitud para que el técnico la evalúe.' }]);
    } catch (error) {
      console.error('Error de red:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Ocurrió un error de conexión con el servidor, pero puedes solicitar una cotización directa con nuestros técnicos.' }]);
    } finally {
      // ESTE BLOQUE GARANTIZA QUE EL LETRERO DE CARGA NUNCA SE QUEDE PEGADO
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Asistente IA" 
        style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#3b82f6', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', position: 'relative' }}
      >
        🤖
        <span style={{ position: 'absolute', top: '2px', right: '2px', width: '13px', height: '13px', background: '#10b981', borderRadius: '50%', border: '2px solid #111827' }}></span>
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div style={{ position: 'absolute', bottom: '75px', right: 0, width: '330px', background: '#111827', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1f2937', padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>⚡ Diagnóstico Nova IA</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
          </div>

          <div style={{ padding: '15px', height: '270px', overflowY: 'auto', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  background: msg.sender === 'user' ? '#3b82f6' : '#1f2937', 
                  color: '#fff', 
                  padding: '10px 12px', 
                  borderRadius: '10px', 
                  maxWidth: '85%', 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  border: msg.sender === 'user' ? 'none' : '1px solid #374151',
                  lineHeight: '1.4',
                  wordBreak: 'break-word'
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ background: '#1f2937', color: '#9ca3af', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', alignSelf: 'flex-start' }}>
                Analizando diagnóstico...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: '10px', background: '#1f2937', display: 'flex', gap: '8px', borderTop: '1px solid #374151' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta aquí..." 
              style={{ flex: 1, background: '#111827', border: '1px solid #374151', padding: '9px 10px', borderRadius: '8px', color: '#fff', fontSize: '12px', outline: 'none' }} 
            />
            <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', opacity: loading ? 0.6 : 1 }}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}