import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/Logo.png';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar usando las clases de index.css */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <img 
              src={logoImg} 
              alt="Nova Technologies" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
            />
            <span className="brand-name">Nova Technologies</span>
          </Link>
          
          <div className="navbar-actions">
            <button 
              onClick={() => navigate(-1)} 
              style={{ 
                background: 'var(--bg-surface-hover)', 
                border: '1px solid var(--border-subtle)', 
                color: 'var(--text-primary)', 
                padding: '8px 16px', 
                borderRadius: 'var(--radius-sm)', 
                cursor: 'pointer', 
                fontSize: '0.9rem', 
                fontWeight: '500' 
              }}
            >
              ← Volver
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, maxWidth: '920px', width: '100%', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '38px', 
          boxShadow: 'var(--shadow-soft)' 
        }}>
          
          {/* Encabezado del Documento */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '22px', marginBottom: '28px' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              backgroundColor: 'rgba(56, 189, 248, 0.15)', 
              color: 'var(--primary-color)', 
              padding: '4px 12px', 
              borderRadius: '6px', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Marco Legal y Políticas de Servicio
            </span>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginTop: '14px', marginBottom: '6px' }}>
              Términos y Condiciones de Uso
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Última actualización: Noviembre de 2026 • Nova Technologies
            </p>
          </div>

          {/* Aviso Destacado sobre Presupuestos */}
          <div style={{ 
            backgroundColor: 'rgba(251, 191, 36, 0.08)', 
            border: '1px solid rgba(251, 191, 36, 0.3)', 
            borderLeft: '4px solid var(--accent-warning)', 
            borderRadius: 'var(--radius-md)', 
            padding: '16px 20px', 
            marginBottom: '28px',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: 'var(--accent-warning)', display: 'block', marginBottom: '4px' }}>
              ⚠️ Nota Importante sobre Cotizaciones y Revisiones
            </strong>
            El primer presupuesto emitido por el técnico corresponde a la <strong>tarifa base de revisión y diagnóstico preliminar</strong>. Una vez inspeccionado físicamente el dispositivo, el costo total puede aumentar si se requieren repuestos o intervenciones adicionales, lo cual siempre requerirá tu aprobación expresa antes de proceder.
          </div>

          {/* Cláusulas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.75' }}>
            
            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Aceptación de los Términos y Capacidad Legal
              </h2>
              <p>
                Al crear una cuenta, iniciar sesión o solicitar cualquier servicio dentro de <strong style={{ color: 'var(--text-primary)' }}>Nova Technologies</strong>, el usuario (en calidad de <em>Cliente</em> o <em>Técnico Especializado</em>) declara aceptar íntegramente estos Términos y Condiciones. Si no está de acuerdo con alguna cláusula, deberá abstenerse de utilizar la plataforma.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. Naturaleza de la Plataforma e Intermediación
              </h2>
              <p>
                Nova Technologies opera como una plataforma digital de conexión y gestión entre propietarios de equipos electrónicos (celulares, tablets, consolas de videojuegos, controles y computadoras) y técnicos independientes verificados. Nova Technologies facilita el flujo de cotización, seguimiento en tiempo real ("Mi Garaje"), comunicación interna y validación de seguridad, siendo cada técnico responsable directo de la ejecución material de sus reparaciones.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                3. Funcionamiento de Presupuestos, Revisiones y Cancelaciones
              </h2>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Cotización Inicial (Revisión):</strong> Al recibir una solicitud, el técnico enviará un primer presupuesto estimado correspondiente al servicio de revisión y valoración técnica inicial. El cliente tiene plena libertad para aceptarlo o rechazarlo.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Cancelación Gratuita del Primer Presupuesto:</strong> Si el cliente rechaza la primera cotización antes de iniciar el servicio, la solicitud se cancelará de manera inmediata, sin necesidad de códigos OTP y sin generar ningún cargo por revisión.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Ajuste de Presupuesto tras Diagnóstico Físico:</strong> Dado que el primer valor cubre la revisión inicial, si al abrir o diagnosticar el equipo se detectan fallas internas ocultas o necesidad de repuestos específicos, el técnico enviará una <strong>propuesta de modificación de precio</strong>. Ningún trabajo adicional se realizará sin el consentimiento del cliente.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Rechazo de Re-cotización en Curso:</strong> Si el cliente rechaza el aumento de precio propuesto una vez el equipo ya fue recibido y diagnosticado físicamente, la orden pasará a estado de cancelación sujeta al pago de la tarifa de revisión/diagnóstico, validada mediante código OTP.
                </li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                4. Canal de Chat y Trazabilidad de Acuerdos
              </h2>
              <p>
                Por seguridad de ambas partes, el chat directo dentro de cada orden permanecerá <strong style={{ color: 'var(--text-primary)' }}>bloqueado hasta que el cliente acepte el presupuesto inicial</strong>. Todas las aprobaciones de precios, evidencias de diagnóstico y acuerdos deben quedar registrados dentro de la plataforma para contar con respaldo ante cualquier disputa.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                5. Protocolo de Seguridad mediante Códigos OTP
              </h2>
              <p>
                Las entregas finales de dispositivos reparados y las cancelaciones posteriores a una revisión física requieren la validación de un <strong style={{ color: 'var(--text-primary)' }}>código OTP (One-Time Password)</strong> único de 6 dígitos generado por el sistema. El cliente debe verificar el correcto funcionamiento de su equipo antes de dictar dicho código al técnico. Una vez validado el OTP, la orden se marca como completada de forma definitiva.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                6. Garantía del Servicio Técnico
              </h2>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Cobertura:</strong> Los servicios ejecutados a través de la plataforma cuentan con garantía sobre la mano de obra y los repuestos instalados conforme a lo acordado en el detalle de la orden.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Exclusiones de Garantía:</strong> La garantía perderá validez si el dispositivo presenta señales de humedad posterior, golpes, caídas, sobrecargas eléctricas, manipulación por terceros ajenos al técnico asignado o daños distintos a la falla originalmente reparada.
                </li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                7. Asistente Virtual de Diagnóstico (Inteligencia Artificial)
              </h2>
              <p>
                El asistente de IA integrado proporciona orientaciones técnicas preliminares basadas en los síntomas descritos por el usuario. Estas sugerencias son meramente informativas y no constituyen un diagnóstico definitivo ni comprometen el precio final del técnico.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                8. Respaldo de Información y Equipos No Reclamados
              </h2>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Copia de Seguridad:</strong> Es responsabilidad exclusiva del cliente realizar un respaldo completo de sus archivos, fotos y cuentas antes de entregar el dispositivo. Ni el técnico ni Nova Technologies se hacen responsables por pérdida de datos derivada de fallas de hardware o restablecimientos necesarios.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Retiro Oportuno:</strong> Una vez notificada la finalización o cancelación de la orden, el cliente deberá coordinar el retiro de su equipo en un plazo razonable acordado con el taller.
                </li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                9. Privacidad y Protección de Datos Personales
              </h2>
              <p>
                La información suministrada durante el registro (nombre, correo electrónico, fotografía de perfil y registros de órdenes) se trata bajo estricta confidencialidad y se utiliza únicamente para la autenticación, comunicación y trazabilidad de los servicios dentro de Nova Technologies.
              </p>
            </section>

          </div>

          {/* Barra de Acciones Inferior */}
          <div style={{ 
            marginTop: '36px', 
            paddingTop: '20px', 
            borderTop: '1px solid var(--border-subtle)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '16px' 
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ¿Tienes preguntas sobre alguna cláusula? Contáctanos en nuestro centro de soporte.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                to="/Contact" 
                style={{ 
                  backgroundColor: 'var(--bg-surface-hover)', 
                  border: '1px solid var(--border-subtle)', 
                  color: 'var(--text-primary)', 
                  padding: '10px 18px', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.85rem', 
                  fontWeight: '500' 
                }}
              >
                Centro de Soporte
              </Link>
              <button 
                onClick={() => navigate(-1)} 
                style={{ 
                  backgroundColor: 'var(--primary-color)', 
                  border: 'none', 
                  color: 'var(--bg-main)', 
                  padding: '10px 20px', 
                  borderRadius: 'var(--radius-sm)', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem', 
                  fontWeight: '700' 
                }}
              >
                Entendido y Volver
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer usando las clases de index.css */}
      <footer className="footer">
        <div className="footer-container">
          <span>© {new Date().getFullYear()} Nova Technologies. Todos los derechos reservados.</span>
          <div className="footer-links">
            <Link to="/">Inicio</Link>
            <Link to="/Contact">Soporte</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}