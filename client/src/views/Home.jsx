import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {

  // Lógica para que el carrusel rote automáticamente
  useEffect(() => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    const slideInterval = setInterval(() => {
      if (slides.length > 0) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
      }
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <>
      {/* BARRA DE NAVEGACIÓN (NAVBAR) */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">Nova Technologies</span>
          </Link>
          
          <nav className="navbar-links">
            <Link to="/" className="nav-link active">Inicio</Link>
            <a href="#about" className="nav-link">Sobre Nosotros</a>
            <a href="#services" className="nav-link">Especialidades</a>
            <Link to="/login?mode=register" className="nav-link">Cotizar Reparación</Link>
            <Link to="/contact" className="nav-link" style={{ color: '#9ca3af', textDecoration: 'none' }}>Soporte</Link>
            <a href="#terms" className="nav-link">Garantías</a>
          </nav>

          <div className="navbar-actions">
            <Link to="/login?mode=login" className="btn btn-outline">Iniciar Sesión</Link>
            <Link to="/login?mode=register" className="btn btn-primary">Registrarse</Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION CON CARRUSEL / SLIDER ROTATIVO */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Carrusel Rotativo */}
          <div className="hero-slider" id="heroSlider">
            <div className="slide active">
              <div className="hero-content">
                <span className="badge badge-success">Conexión Directa y Segura</span>
                <h1 className="hero-title">Repara tus dispositivos con los mejores técnicos especializados</h1>
                <p className="hero-description">
                  Conectamos de forma transparente a clientes con talleres independientes y expertos certificados en telefonía, consolas de videojuegos, controles y computadoras.
                </p>
                <div className="hero-buttons">
                  <Link to="/login?mode=register" className="btn btn-primary">Solicitar Cotización</Link>
                  <a href="#services" className="btn btn-outline">Ver Especialidades</a>
                </div>
              </div>
            </div>
            <div className="slide">
              <div className="hero-content">
                <span className="badge badge-warning">Transparencia en el Precio</span>
                <h1 className="hero-title">Presupuestos claros y pagos blindados por código OTP</h1>
                <p className="hero-description">
                  Sin sorpresas ni cobros ocultos. Valida tu presupuesto en línea y libera el pago al taller únicamente cuando el servicio haya finalizado con éxito.
                </p>
                <div className="hero-buttons">
                  <Link to="/login?mode=register" className="btn btn-primary">Empezar Ahora</Link>
                  <a href="#terms" className="btn btn-outline">Conocer Políticas</a>
                </div>
              </div>
            </div>
            <div className="slide">
              <div className="hero-content">
                <span className="badge badge-success">Asistencia Inteligente</span>
                <h1 className="hero-title">Diagnóstico previo asistido por Inteligencia Artificial</h1>
                <p className="hero-description">
                  Consulta con nuestro asistente técnico especializado en tiempo real para identificar posibles fallas en tu equipo antes de enviarlo a taller.
                </p>
                <div className="hero-buttons">
                  <Link to="/login?mode=register" className="btn btn-primary">Cotizar Equipo</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral / Vista Previa */}
          <div className="hero-visual">
            <div className="card hero-card-preview">
              <h3>⚡ Garantía Nova Technologies</h3>
              <ul className="preview-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                <li>✔️ Técnicos verificados por calificaciones reales.</li>
                <li>✔️ Seguimiento paso a paso del estado de tu equipo.</li>
                <li>✔️ Historial de reparaciones en tu Garaje personal.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN SOBRE NOSOTROS (EMPRESA) */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="section-header">
            <h2>¿Quiénes Somos en Nova Technologies?</h2>
            <p>Transformamos la experiencia de servicio técnico combinando confianza, tecnología y soporte profesional.</p>
          </div>
          <div className="about-grid">
            <div className="card about-card">
              <h3>🎯 Nuestra Misión</h3>
              <p>Brindar una plataforma digital eficiente y segura que solucione la brecha de confianza entre los usuarios que necesitan reparar sus dispositivos y los mejores técnicos locales del mercado.</p>
            </div>
            <div className="card about-card">
              <h3>🔒 Transparencia Absoluta</h3>
              <p>Fomentamos un ecosistema donde las valoraciones y reseñas son exclusivas de clientes que completaron un servicio real, garantizando calificaciones confiables y sin manipulaciones.</p>
            </div>
            <div className="card about-card">
              <h3>🚀 Innovación Continua</h3>
              <p>Integramos herramientas avanzadas como control de estados con códigos OTP, gestión de dispositivos en un garaje virtual y asistencia técnica potenciada por inteligencia artificial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE SERVICIOS Y CATEGORÍAS */}
      <section id="services" className="services-section">
        <div className="services-container">
          <div className="section-header">
            <h2>Especialidades y Categorías de Reparación</h2>
            <p>Selecciona la categoría del dispositivo o accesorio que necesitas reparar con expertos certificados.</p>
          </div>
          
          <div className="services-grid-horizontal">
            <div className="card service-card">
              <div className="service-icon">📱</div>
              <h3>Celulares y Tablets</h3>
              <p>Cambio de pantallas OLED/IPS, baterías de alta duración, puertos de carga tipo C y recuperación avanzada ante humedad.</p>
              <Link to="/login?mode=register" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', display: 'inline-flex' }}>Cotizar Celular</Link>
            </div>

            <div className="card service-card">
              <div className="service-icon">🎮🕹️</div>
              <h3>Consolas y Controles</h3>
              <p>Mantenimiento preventivo, cambio de pasta térmica, reparación de puertos HDMI y solución de *stick drift* en mandos de PlayStation, Xbox y Nintendo.</p>
              <Link to="/login?mode=register" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', display: 'inline-flex' }}>Cotizar Consola / Mando</Link>
            </div>

            <div className="card service-card">
              <div className="service-icon">💻🖥️</div>
              <h3>Computadoras y Laptops</h3>
              <p>Optimización de sistemas, instalación de SSD/RAM, cambio de pantallas, reparación de bisagras, fuentes de poder y tarjetas gráficas.</p>
              <Link to="/login?mode=register" className="btn btn-outline" style={{ marginTop: '20px', width: '100%', display: 'inline-flex' }}>Cotizar PC / Laptop</Link>
            </div>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE DE IA */}
      <div className="ai-widget-container">
        <button className="ai-fab-btn" aria-label="Asistente IA">
            <span className="ai-fab-icon">🤖</span>
            <span className="ai-pulse-ring"></span>
        </button>
      </div>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="footer">
        <div className="footer-container">
            <p>&copy; 2026 Nova Technologies. Todos los derechos reservados.</p>
            <div className="footer-links">
                <a href="#terms">Términos y Condiciones</a>
                <Link to="/Contact">Centro de Soporte</Link>
            </div>
        </div>
      </footer>
    </>
  );
}