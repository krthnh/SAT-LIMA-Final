import { Link } from 'react-router-dom';

export default function Papeletas() {
  return (
    <>
      <header className="sub-header">
        <div className="header-container">
          <div className="brand">
            <div className="img-container logo-container">
              <img src="/img/SAT_logo.jpg" alt="Logo SAT" className="adaptive-img" />
            </div>
            <div>
              <h1>SAT <span>Perú</span></h1>
              <p className="tagline">Servicio de Administración Tributaria de Lima</p>
            </div>
          </div>
          <nav className="sub-nav">
            <Link to="/">&larr; Volver al Inicio</Link>
          </nav>
        </div>
      </header>

      <main className="page-container">
        <nav className="subpages-tabs">
          <Link to="/impuesto-predial" className="tab-item">Impuesto Predial</Link>
          <Link to="/impuesto-vehicular" className="tab-item">Impuesto Vehicular</Link>
          <Link to="/papeletas" className="tab-item active">Papeletas de Tránsito</Link>
        </nav>

        <section className="content-card">
          <header className="card-header">
            <h2>Consulta y Pago de Papeletas de Tránsito</h2>
            <span className="badge">Infracciones de Tránsito</span>
          </header>

          <div className="img-container detail-img-container" style={{ height: 250, borderRadius: 6, marginBottom: '1.5rem', border: '1px solid #d1d5db' }}>
            <img src="/img/Papeleta2.jpg" alt="Papeletas e infracciones de tránsito" className="adaptive-img" />
          </div>

          <p className="description">
            Gestione el estado de las sanciones e infracciones al Reglamento Nacional de Tránsito y Transporte imponibles dentro de la jurisdicción de Lima Metropolitana.
          </p>

          <div className="info-box">
            <h3>Información Clave:</h3>
            <ul>
              <li><strong>Descuentos por pronto pago:</strong> Hasta 83% de descuento si se cancela dentro de los primeros 5 días hábiles contados desde el día siguiente de la notificación.</li>
              <li><strong>Papeletas M1 y M2:</strong> Por ser faltas muy graves, no aplican a descuentos de ley.</li>
              <li><strong>Requisitos para consulta:</strong> Número de Papeleta o Número de Placa del vehículo infractor.</li>
            </ul>
          </div>

          <div className="action-container">
            <Link to="/#consultas" className="btn-danger">Iniciar Consulta de Papeletas</Link>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; Servicio de Administración Tributaria de Lima - SAT Perú.</p>
      </footer>
    </>
  );
}
