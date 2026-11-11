import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'register' ? 'register' : 'login';

  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulario de registro tradicional
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Estado acumulativo del modal multi-paso (Wizard)
  const [modalStep, setModalStep] = useState(0); // 0 = cerrado, 1, 2, 3
  const [pendingAuthData, setPendingAuthData] = useState({});

  // Campos del modal de registro
  const [userRole, setUserRole] = useState('client');
  const [modalName, setModalName] = useState('');
  const [modalAge, setModalAge] = useState('');
  const [modalBirthDate, setModalBirthDate] = useState('');
  const [modalIdentityDoc, setModalIdentityDoc] = useState('');
  const [modalProfilePic, setModalProfilePic] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  // Cambiar entre modos al hacer clic en los enlaces
  const switchMode = (mode) => {
    setIsRegisterMode(mode === 'register');
  };

  // Inicializar Google Auth Script
  useEffect(() => {
    const initGoogleAuth = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
          client_id: "231709008983-vh0qcfeoan98rn4foopi89u7u4scfmbo.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
      } else {
        setTimeout(initGoogleAuth, 500);
      }
    };
    initGoogleAuth();
  }, []);

  const triggerGoogle = (e) => {
    e.preventDefault();
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      alert('Google Identity Services no está disponible todavía.');
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.needsRoleSelection) {
          setPendingAuthData({ authType: 'google', credential: response.credential });
          setModalStep(1);
        } else {
          localStorage.setItem('token', data.token);
          redirectUser(data.role);
        }
      } else {
        alert(data.message || 'Error al autenticar con Google.');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  // Login Tradicional
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        redirectUser(data.role);
      } else {
        alert(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    }
  };

  // Registro Tradicional (Inicia el proceso multi-paso)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setPendingAuthData({ authType: 'email', name: regName, email: regEmail, password: regPassword });
    setModalName(regName);
    setModalStep(1);
  };

  // Navegación del Wizard
  const handleNextToStep2 = () => {
    setPendingAuthData(prev => ({ ...prev, role: userRole }));
    setModalStep(2);
  };

  const handleNextToStep3 = async () => {
    if (!modalName || !modalAge || !modalBirthDate) {
      alert('Por favor completa los campos obligatorios de información personal.');
      return;
    }

    if (userRole === 'technician') {
      if (!modalIdentityDoc) {
        alert('El número de documento de identidad es obligatorio para técnicos.');
        return;
      }
      if (!modalProfilePic) {
        alert('La foto de perfil es obligatoria para técnicos.');
        return;
      }
    }

    const updatedData = {
      ...pendingAuthData,
      age: modalAge,
      birthDate: modalBirthDate,
      identityDoc: modalIdentityDoc,
      profilePic: modalProfilePic,
      name: modalName || pendingAuthData.name
    };

    setPendingAuthData(updatedData);

    if (userRole === 'technician') {
      setModalStep(3);
    } else {
      submitCompleteRegistration(updatedData);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setModalProfilePic(reader.result);
      };
    }
  };

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setSelectedSpecialties(prev => 
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleFinalRegistration = () => {
    if (selectedSpecialties.length === 0) {
      alert('Por favor selecciona al menos una especialidad de trabajo.');
      return;
    }
    const finalData = { ...pendingAuthData, specialties: selectedSpecialties };
    submitCompleteRegistration(finalData);
  };

  const submitCompleteRegistration = async (dataPayload) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setModalStep(0);
        redirectUser(data.role);
      } else {
        alert(data.message || 'Error al completar el registro.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const redirectUser = (role) => {
    if (role === 'technician') navigate('/technician-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
    else navigate('/client-dashboard');
  };

  return (
    <div className="auth-section">
      <div className="card auth-card">
        
        {/* Logo y Retorno */}
        <div className="auth-header">
          <Link to="/" className="navbar-brand" style={{ justifyContent: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="brand-icon">⚡</span>
            <span className="brand-name">Nova Technologies</span>
          </Link>
          <h1>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h1>
          <p>{isRegisterMode ? 'Únete a Nova Technologies hoy mismo.' : 'Ingresa a tu cuenta para gestionar tus solicitudes.'}</p>
        </div>

        {/* FORMULARIO DE INICIO DE SESIÓN */}
        <form onSubmit={handleLoginSubmit} className={`auth-form ${!isRegisterMode ? 'active' : ''}`}>
          <button type="button" className="btn btn-outline" onClick={triggerGoogle} style={{ width: '100%', marginBottom: '20px' }}>
            🌐 Continuar con Google
          </button>

          <div className="auth-divider">o con tu correo</div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              value={loginEmail} 
              onChange={(e) => setLoginEmail(e.target.value)} 
              className="form-input" 
              placeholder="tu@correo.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)} 
              className="form-input" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Entrar a la Plataforma</button>

          <p className="auth-switch-text">
            ¿No tienes una cuenta? <span onClick={() => switchMode('register')} className="auth-link">Regístrate aquí</span>
          </p>
        </form>

        {/* FORMULARIO DE REGISTRO */}
        <form onSubmit={handleRegisterSubmit} className={`auth-form ${isRegisterMode ? 'active' : ''}`}>
          <button type="button" className="btn btn-outline" onClick={triggerGoogle} style={{ width: '100%', marginBottom: '20px' }}>
            🌐 Registrarse con Google
          </button>

          <div className="auth-divider">o con tu correo</div>

          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              value={regName} 
              onChange={(e) => setRegName(e.target.value)} 
              className="form-input" 
              placeholder="Tu nombre" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              value={regEmail} 
              onChange={(e) => setRegEmail(e.target.value)} 
              className="form-input" 
              placeholder="tu@correo.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              value={regPassword} 
              onChange={(e) => setRegPassword(e.target.value)} 
              className="form-input" 
              placeholder="Mínimo 6 caracteres" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Crear Cuenta</button>

          <p className="auth-switch-text">
            ¿Ya tienes una cuenta? <span onClick={() => switchMode('login')} className="auth-link">Inicia sesión</span>
          </p>
        </form>

      </div>

      {/* MODAL DE REGISTRO MULTI-PASO */}
      {modalStep > 0 && (
        <div className="role-modal">
          <div className="role-modal-content">
            
            {/* PASO 1: Selección de Rol */}
            {modalStep === 1 && (
              <div className="modal-step">
                <div className="role-modal-header">
                  <span className="brand-icon" style={{ fontSize: '36px' }}>⚡</span>
                  <h2>¡Bienvenido a Nova Technologies!</h2>
                  <p>Paso 1 de 3: Selecciona cómo deseas utilizar la plataforma:</p>
                </div>
                
                <div className="role-options-grid">
                  <label className="role-card-option">
                    <input 
                      type="radio" 
                      name="userRole" 
                      value="client" 
                      checked={userRole === 'client'} 
                      onChange={() => setUserRole('client')} 
                    />
                    <div className="role-card-inner">
                      <div className="role-icon">👤</div>
                      <h3>Soy Cliente</h3>
                      <p>Busco solicitar reparaciones y hacer seguimiento en tiempo real.</p>
                      <span className="role-badge">Solicitar Servicio</span>
                    </div>
                  </label>

                  <label className="role-card-option">
                    <input 
                      type="radio" 
                      name="userRole" 
                      value="technician" 
                      checked={userRole === 'technician'} 
                      onChange={() => setUserRole('technician')} 
                    />
                    <div className="role-card-inner">
                      <div className="role-icon">🔧</div>
                      <h3>Soy Técnico / Taller</h3>
                      <p>Ofrezco servicios técnicos y atiendo solicitudes de reparación.</p>
                      <span className="role-badge">Atender Órdenes</span>
                    </div>
                  </label>
                </div>
                <button type="button" onClick={handleNextToStep2} className="btn btn-primary btn-confirm-wide">Siguiente</button>
              </div>
            )}

            {/* PASO 2: Información Personal */}
            {modalStep === 2 && (
              <div className="modal-step">
                <div className="role-modal-header">
                  <h2>Información Personal</h2>
                  <p>Paso 2 de 3: Completa tus datos básicos para tu perfil:</p>
                </div>

                <div className="form-group-grid">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Nombre Completo</label>
                    <input type="text" value={modalName} onChange={(e) => setModalName(e.target.value)} className="form-input" placeholder="Tu nombre completo" required />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Edad</label>
                    <input type="number" value={modalAge} onChange={(e) => setModalAge(e.target.value)} className="form-input" placeholder="Ej: 25" required />
                  </div>
                </div>

                <div className="form-group-grid">
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Fecha de Nacimiento</label>
                    <input type="date" value={modalBirthDate} onChange={(e) => setModalBirthDate(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">
                      Nº Documento de Identidad{' '}
                      <span style={{ color: userRole === 'technician' ? '#3b82f6' : '#9ca3af', fontWeight: 'normal' }}>
                        {userRole === 'technician' ? '(Obligatorio)' : '(Opcional)'}
                      </span>
                    </label>
                    <input type="text" value={modalIdentityDoc} onChange={(e) => setModalIdentityDoc(e.target.value)} className="form-input" placeholder="Cédula o Documento" />
                  </div>
                </div>

                <div className="form-group" style={{ textAlign: 'left', marginTop: '15px' }}>
                  <label className="form-label">
                    Foto de Perfil{' '}
                    <span style={{ color: userRole === 'technician' ? '#ef4444' : '#3b82f6' }}>
                      {userRole === 'technician' ? '(Obligatorio)' : '(Opcional)'}
                    </span>
                  </label>
                  <input type="file" onChange={handleFileChange} className="form-input" accept="image/*" style={{ padding: '10px', background: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button type="button" onClick={() => setModalStep(1)} className="btn btn-outline" style={{ width: '50%' }}>Atrás</button>
                  <button type="button" onClick={handleNextToStep3} className="btn btn-primary" style={{ width: '50%' }}>Siguiente</button>
                </div>
              </div>
            )}

            {/* PASO 3: Especialidades (Solo para Técnicos) */}
            {modalStep === 3 && (
              <div className="modal-step">
                <div className="role-modal-header">
                  <h2>Especialidades del Técnico</h2>
                  <p>Paso 3 de 3: ¿En qué áreas trabajarás?</p>
                </div>

                <div className="role-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '25px 0', textAlign: 'left' }}>
                  {['Celulares y Tablets', 'Consolas y Controles', 'Computadoras y Laptops'].map((spec) => (
                    <label key={spec} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1f2937', border: '1px solid #374151', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        value={spec} 
                        checked={selectedSpecialties.includes(spec)}
                        onChange={handleSpecialtyChange}
                        style={{ transform: 'scale(1.3)' }} 
                      />
                      <span style={{ color: '#fff', fontSize: '15px' }}>
                        {spec === 'Celulares y Tablets' && '📱 Celulares y Tablets (Pantallas, baterías, puertos)'}
                        {spec === 'Consolas y Controles' && '🎮 Consolas y Controles (PlayStation, Xbox, Stick Drift)'}
                        {spec === 'Computadoras y Laptops' && '💻 Computadoras y Laptops (Hardware, fuentes, SSD)'}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                  <button type="button" onClick={() => setModalStep(2)} className="btn btn-outline" style={{ width: '50%' }}>Atrás</button>
                  <button type="button" onClick={handleFinalRegistration} className="btn btn-primary" style={{ width: '50%' }}>Finalizar Registro</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Estilos embebidos para el modal (los mismos de tu CSS) */}
      <style>{`
        .role-modal {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 15, 30, 0.88); backdrop-filter: blur(8px);
            display: flex; justify-content: center; align-items: center; z-index: 99999; padding: 20px;
        }
        .role-modal-content {
            background: #111827; border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 35px; border-radius: 20px; max-width: 750px; width: 95%;
            text-align: center; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7); color: #ffffff;
        }
        .role-modal-header h2 { font-size: 24px; margin: 8px 0 4px 0; color: #fff; }
        .role-modal-header p { color: #9ca3af; font-size: 14px; margin-bottom: 20px; }
        
        .role-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .role-card-option input[type="radio"] { display: none; }
        .role-card-inner {
            background: #1f2937; border: 2px solid #374151; padding: 25px 15px; border-radius: 14px;
            cursor: pointer; transition: all 0.2s ease; height: 100%; display: flex; flex-direction: column;
            align-items: center; justify-content: space-between; text-align: center;
        }
        .role-card-inner:hover { border-color: #3b82f6; background: #253346; }
        .role-card-option input[type="radio"]:checked + .role-card-inner {
            border-color: #3b82f6; background: linear-gradient(180deg, rgba(59, 130, 246, 0.15) 0%, rgba(31, 41, 55, 1) 100%);
        }
        .role-icon { font-size: 42px; margin-bottom: 10px; }
        .role-card-inner h3 { font-size: 18px; color: #fff; margin-bottom: 6px; }
        .role-card-inner p { font-size: 12.5px; color: #9ca3af; line-height: 1.4; margin-bottom: 12px; }
        .role-badge { font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; background: rgba(255,255,255,0.08); color: #cbd5e1; }
        .role-card-option input[type="radio"]:checked + .role-card-inner .role-badge { background: #3b82f6; color: #fff; }

        .form-group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 12px; }
        .btn-confirm-wide { padding: 12px; font-size: 16px; font-weight: 600; border-radius: 10px; width: 100%; cursor: pointer; }
      `}</style>
    </div>
  );
}