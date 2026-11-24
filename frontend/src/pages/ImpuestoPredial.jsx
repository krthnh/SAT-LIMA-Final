import { Link } from 'react-router-dom';

export default function ImpuestoPredial() {
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
          <Link to="/impuesto-predial" className="tab-item active">Impuesto Predial</Link>
          <Link to="/impuesto-vehicular" className="tab-item">Impuesto Vehicular</Link>
          <Link to="/papeletas" className="tab-item">Papeletas de Tránsito</Link>
        </nav>

        <section className="content-card">
          <header className="card-header">
            <h2>Consulta y Pago de Impuesto Predial</h2>
            <span className="badge">Tributo Municipal</span>
          </header>

          <div className="img-container detail-img-container" style={{ height: 250, borderRadius: 6, marginBottom: '1.5rem', border: '1px solid #d1d5db' }}>
            <img src="/img/PredioUrbano.jpg" alt="Predio Urbano / Vivienda" className="adaptive-img" />
          </div>

          <p className="description">
            El Impuesto Predial es un tributo de periodicidad anual que grava el valor de los predios urbanos y rústicos (terrenos, casas, departamentos, oficinas o edificios) ubicados en el distrito del Cercado de Lima.
          </p>

          <div className="info-box">
            <h3>Información Clave:</h3>
            <ul>
              <li><strong>Periodicidad:</strong> Anual (puede abonarse al contado o en cuatro cuotas trimestrales en febrero, mayo, agosto y noviembre).</li>
              <li><strong>Base imponible:</strong> Se calcula aplicando la escala progresiva acumulativa sobre el valor de autoavalúo registrado.</li>
              <li><strong>Requisitos para consulta:</strong> Código de Administrado, DNI o RUC del titular registral del predio.</li>
            </ul>
          </div>

          <div className="action-container">
            <Link to="/#consultas" className="btn-danger">Iniciar Consulta de Predios</Link>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; Servicio de Administración Tributaria de Lima - SAT Perú.</p>
      </footer>
    </>
  );
}
