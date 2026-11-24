import { Link } from 'react-router-dom';

export default function ImpuestoVehicular() {
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
          <Link to="/impuesto-vehicular" className="tab-item active">Impuesto Vehicular</Link>
          <Link to="/papeletas" className="tab-item">Papeletas de Tránsito</Link>
        </nav>

        <section className="content-card">
          <header className="card-header">
            <h2>Consulta y Pago de Impuesto Vehicular</h2>
            <span className="badge">Propiedad Vehicular</span>
          </header>

          <div className="img-container detail-img-container" style={{ height: 250, borderRadius: 6, marginBottom: '1.5rem', border: '1px solid #d1d5db' }}>
            <img src="/img/ParqueAutomotor.jpg" alt="Vehículo o parque automotor" className="adaptive-img" />
          </div>

          <p className="description">
            El Impuesto al Patrimonio Vehicular grava la propiedad de los vehículos (automóviles, camionetas, station wagons, buses y camiones) con una antigüedad no mayor a tres (3) años desde su primera inscripción en el Registro de Propiedad Vehicular de la SUNARP.
          </p>

          <div className="info-box">
            <h3>Información Clave:</h3>
            <ul>
              <li><strong>Tasa del impuesto:</strong> Aplica el 1% de la base imponible del valor del vehículo asignado en la tabla de valores del MEF.</li>
              <li><strong>Sujetos obligados:</strong> Personas naturales o jurídicas propietarias del vehículo al 1 de enero de cada ejercicio gravable.</li>
              <li><strong>Requisitos para consulta:</strong> Número de Placa del vehículo o Documento Nacional de Identidad del propietario registrado.</li>
            </ul>
          </div>

          <div className="action-container">
            <Link to="/#consultas" className="btn-danger">Iniciar Consulta Vehicular</Link>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; Servicio de Administración Tributaria de Lima - SAT Perú.</p>
      </footer>
    </>
  );
}
