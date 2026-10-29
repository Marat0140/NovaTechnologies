document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    let pendingAuthData = {}; // Objeto acumulativo para el proceso multi-paso

    // 1. Control de vistas (Login / Registro)
    function showMode(mode) {
        if (mode === 'register') {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            authTitle.textContent = 'Crear Cuenta';
            authSubtitle.textContent = 'Únete a Nova Technologies hoy mismo.';
        } else {
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
            authTitle.textContent = 'Iniciar Sesión';
            authSubtitle.textContent = 'Ingresa a tu cuenta para gestionar tus solicitudes.';
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    showMode(urlParams.get('mode'));

    if (switchToRegister) switchToRegister.addEventListener('click', (e) => { e.preventDefault(); showMode('register'); });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showMode('login'); });

    // 2. Google Auth Init
    function initGoogleAuth() {
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: "231709008983-vh0qcfeoan98rn4foopi89u7u4scfmbo.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });
            const triggerGoogle = (e) => { e.preventDefault(); google.accounts.id.prompt(); };
            const gLogin = document.getElementById('googleLoginBtn');
            const gReg = document.getElementById('googleRegisterBtn');
            if (gLogin) gLogin.addEventListener('click', triggerGoogle);
            if (gReg) gReg.addEventListener('click', triggerGoogle);
        } else {
            setTimeout(initGoogleAuth, 500);
        }
    }
    initGoogleAuth();

    async function handleCredentialResponse(response) {
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.needsRoleSelection) {
                    pendingAuthData = { authType: 'google', credential: response.credential };
                    openModalStep(1);
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
    }

    // Login Tradicional
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
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
        });
    }

    // Registro Tradicional (Inicia el proceso multi-paso)
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            pendingAuthData = { authType: 'email', name, email, password };
            
            // Pre-llenar el campo de nombre en el paso 2 si ya lo escribió
            document.getElementById('modalName').value = name;
            openModalStep(1);
        });
    }

    // ==========================================
    // CONTROL DEL WIZARD DE PASOS EN EL MODAL
    // ==========================================
    function openModalStep(step) {
        document.getElementById('roleModal').style.display = 'flex';
        document.getElementById('step1').style.display = step === 1 ? 'block' : 'none';
        document.getElementById('step2').style.display = step === 2 ? 'block' : 'none';
        document.getElementById('step3').style.display = step === 3 ? 'block' : 'none';

        // Ajustar requerimientos visuales según el rol seleccionado en el Paso 1
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
        const docLabel = document.getElementById('docLabel');
        const docOptional = document.getElementById('docOptional');
        const photoTag = document.getElementById('photoRequiredTag');

        if (selectedRole === 'technician') {
            docOptional.textContent = '(Obligatorio)';
            docOptional.style.color = '#3b82f6';
            photoTag.textContent = '(Obligatorio)';
            photoTag.style.color = '#ef4444';
        } else {
            docOptional.textContent = '(Opcional)';
            docOptional.style.color = '#9ca3af';
            photoTag.textContent = '(Opcional)';
            photoTag.style.color = '#3b82f6';
        }
    }

    // Botón Siguiente de Paso 1 a Paso 2
    document.getElementById('nextToStep2').addEventListener('click', () => {
        const role = document.querySelector('input[name="userRole"]:checked').value;
        pendingAuthData.role = role;
        openModalStep(2);
    });

    // Botón Atrás de Paso 2 a Paso 1
    document.getElementById('backToStep1').addEventListener('click', () => openModalStep(1));

    // Botón Siguiente de Paso 2 a Paso 3 (o Finalizar si es Cliente)
    document.getElementById('nextToStep3').addEventListener('click', async () => {
        const name = document.getElementById('modalName').value;
        const age = document.getElementById('modalAge').value;
        const birthDate = document.getElementById('modalBirthDate').value;
        const identityDoc = document.getElementById('modalIdentityDoc').value;
        const fileInput = document.getElementById('modalProfilePic');

        if (!name || !age || !birthDate) {
            alert('Por favor completa los campos obligatorios de información personal.');
            return;
        }

        if (pendingAuthData.role === 'technician') {
            if (!identityDoc) {
                alert('El número de documento de identidad es obligatorio para técnicos.');
                return;
            }
            if (fileInput.files.length === 0) {
                alert('La foto de perfil es obligatoria para técnicos.');
                return;
            }
        }

        pendingAuthData.age = age;
        pendingAuthData.birthDate = birthDate;
        pendingAuthData.identityDoc = identityDoc;
        if (name && pendingAuthData.authType === 'email') pendingAuthData.name = name; // Actualizar si cambió

        // Convertir imagen a Base64 si se seleccionó
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.files[0]);
            reader.onload = async function () {
                pendingAuthData.profilePic = reader.result;
                proceedAfterStep2();
            };
        } else {
            pendingAuthData.profilePic = '';
            proceedAfterStep2();
        }
    });

    function proceedAfterStep2() {
        if (pendingAuthData.role === 'technician') {
            openModalStep(3); // Los técnicos pasan a escoger especialidades
        } else {
            submitCompleteRegistration(); // Los clientes finalizan aquí directo
        }
    }

    document.getElementById('backToStep2').addEventListener('click', () => openModalStep(2));

    // Botón Finalizar en Paso 3 (Técnicos)
    document.getElementById('confirmFinalRegistration').addEventListener('click', () => {
        const selectedSpecialties = [];
        document.querySelectorAll('input[name="specialty"]:checked').forEach(cb => {
            selectedSpecialties.push(cb.value);
        });

        if (selectedSpecialties.length === 0) {
            alert('Por favor selecciona al menos una especialidad de trabajo.');
            return;
        }

        pendingAuthData.specialties = selectedSpecialties;
        submitCompleteRegistration();
    });

    // Envío final unificado al backend para guardar en MongoDB
    async function submitCompleteRegistration() {
        try {
            const res = await fetch('http://localhost:5000/api/auth/complete-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingAuthData)
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                document.getElementById('roleModal').style.display = 'none';
                redirectUser(data.role);
            } else {
                alert(data.message || 'Error al completar el registro.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar con el servidor.');
        }
    }

    function redirectUser(role) {
        if (role === 'technician') {
            window.location.href = 'technician-dashboard.html';
        } else if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'client-dashboard.html';
        }
    }
});