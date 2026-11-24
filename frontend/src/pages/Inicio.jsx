import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Inicio() {
  const { usuario } = useAuth();

  // --- Estado consulta ---
  const [consultaTipo, setConsultaTipo] = useState('TODOS');
  const [consultaDni, setConsultaDni] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [consultaError, setConsultaError] = useState('');
  const [buscando, setBuscando] = useState(false);

  // --- Estado registro reclamo ---
  const [reclamo, setReclamo] = useState({
    nombre: '', dni: '', tipo: 'Predial', motivo: '', valor_tasacion: ''
  });
  const [montoCalculado, setMontoCalculado] = useState(12.0);
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [reclamoMsg, setReclamoMsg] = useState('');
  const [reclamoError, setReclamoError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Tarifario en tiempo real (1.5% + S/12)
  const recalcular = (valor) => {
    const v = parseFloat(valor) || 0;
    const monto = v > 0 ? Math.round(((v * 0.015) + 12) * 100) / 100 : 12.0;
    setMontoCalculado(monto);
  };

  const handleConsulta = async (e) => {
    e.preventDefault();
    setConsultaError('');
    if (!consultaDni || consultaDni.length !== 8 || isNaN(consultaDni)) {
      setConsultaError('Por favor, ingrese un número de DNI válido (8 dígitos).');
      return;
    }
    setBuscando(true);
    try {
      const res = await api.consultaPublica(consultaDni, consultaTipo);
      setResultados(res.reclamos || []);
      setMostrarResultados(true);
    } catch (err) {
      setConsultaError('Error al consultar: ' + err.message);
    } finally {
      setBuscando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setReclamoError('');
    setReclamoMsg('');

    if (!usuario) {
      setReclamoError('Debe iniciar sesión para registrar un reclamo.');
      return;
    }

    setGuardando(true);
    try {
      const res = await api.crearReclamo({
        nombre_propietario: reclamo.nombre,
        dni: reclamo.dni,
        tipo_impuesto: reclamo.tipo,
        motivo: reclamo.motivo,
        valor_tasacion: parseFloat(reclamo.valor_tasacion) || 0,
        monto_calculado: montoCalculado
      });
      setCodigoGenerado(res.reclamo.codigo_seguimiento);
      setReclamoMsg('¡Reclamo Guardado en la Base de Datos!');
      setReclamo({
        nombre: '', dni: '', tipo: 'Predial', motivo: '', valor_tasacion: ''
      });
      setMontoCalculado(12.0);
      setTimeout(() => {
        document.getElementById('reclamo-resultado')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      setReclamoError('Error al registrar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section id="inicio" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h2>Portal Institucional de Tributación Municipal</h2>
            <p>Gestione el cumplimiento de sus obligaciones tributarias de forma rápida, transparente y eficiente en la provincia de Lima.</p>
            <div className="hero-buttons">
              <a href="#consultas" className="btn btn-primary">Consultar Deuda</a>
              <a href="#servicios" className="btn btn-secondary">Ver Trámites</a>
            </div>
          </div>
          <div className="img-container hero-img-container">
            <picture>
              <source media="(max-width: 600px)" srcSet="/img/BannerInicio.jpg" />
              <img src="/img/BannerInicio.jpg" alt="Banner Principal SAT" className="adaptive-img" />
            </picture>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="section-container">
        <div className="section-title">
          <h2>Trámites y Servicios Destacados</h2>
          <p>Acceda directamente a la subpágina especializada de cada servicio tributario</p>
        </div>
        <div className="services-nav-grid">
          <Link to="/impuesto-predial" className="nav-card">
            <div className="img-container card-img-container">
              <img src="/img/ImpuestoPredial.jpg" alt="Imagen Impuesto Predial" className="adaptive-img" />
            </div>
            <div className="card-body">
              <span className="card-tag">Municipalidad de Lima</span>
              <h3>Impuesto Predial</h3>
              <p>Consulta sobre la propiedad urbana/rústica, cronograma de pagos y beneficios fiscales.</p>
              <span className="card-link">Ir a la sección &rarr;</span>
            </div>
          </Link>
          <Link to="/impuesto-vehicular" className="nav-card">
            <div className="img-container card-img-container">
              <img src="/img/ImpuestoVehicular.jpg" alt="Imagen Impuesto Vehicular" className="adaptive-img" />
            </div>
            <div className="card-body">
              <span className="card-tag">Registro Vehicular</span>
              <h3>Impuesto Vehicular</h3>
              <p>Información de tributación para vehículos con antigüedad menor a tres años.</p>
              <span className="card-link">Ir a la sección &rarr;</span>
            </div>
          </Link>
          <Link to="/papeletas" className="nav-card">
            <div className="img-container card-img-container">
              <img src="/img/Papeletas.jpg" alt="Imagen Papeletas de Tránsito" className="adaptive-img" />
            </div>
            <div className="card-body">
              <span className="card-tag">Tránsito y Transporte</span>
              <h3>Papeletas de Tránsito</h3>
              <p>Búsqueda de infracciones, pronto pago con descuentos y trámites de descarga.</p>
              <span className="card-link">Ir a la sección &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="section-container bg-light">
        <div className="section-title">
          <h2>¿Cómo realizar sus trámites y pagos?</h2>
          <p>Pasos a seguir para consultar y regularizar su situación tributaria</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Identificación</h3>
            <p>Disponga de su número de DNI, RUC, placa de vehículo o Código de Administrado.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>Consulta de Estado</h3>
            <p>Acceda a la opción de búsqueda para revisar desglose de deudas o valores tributarios.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>Selección de Pago</h3>
            <p>Elija los conceptos a cancelar y seleccione la modalidad presencial o virtual.</p>
          </div>
          <div className="step-card">
            <span className="step-number">4</span>
            <h3>Constancia Oficial</h3>
            <p>Reciba o descargue su comprobante oficial de pago digital con validez institucional.</p>
          </div>
        </div>
      </section>

      {/* CONSULTA DE DEUDA */}
      <section id="consultas" className="section-container" style={{ maxWidth: 1000, margin: '2rem auto', width: '95%' }}>
        <div className="form-wrapper" style={{ width: '100%', padding: 25 }}>
          <div className="section-title">
            <div className="svg-alert-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12.01" y2="18" className="pulse-dot"></line>
                <line x1="12" y1="11" x2="12" y2="15"></line>
              </svg>
            </div>
            <h2>Consulta de Deuda / Reclamos</h2>
            <p>Verifique sus montos pendientes, impuestos prediales, vehiculares o papeletas</p>
          </div>

          <form id="form-consulta" className="sat-form" onSubmit={handleConsulta}>
            <div className="form-group">
              <label htmlFor="consulta-tipo">Tipo de Deuda *</label>
              <select id="consulta-tipo" value={consultaTipo} onChange={e => setConsultaTipo(e.target.value)} className="form-control" required>
                <option value="TODOS">-- Todos los tipos de tributo --</option>
                <option value="Impuesto Predial">Impuesto Predial</option>
                <option value="Impuesto Vehicular">Impuesto Vehicular</option>
                <option value="Papeleta">Papeletas de Tránsito</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consulta-doc-tipo">Tipo de Documento *</label>
                <select id="consulta-doc-tipo" disabled className="form-control" required>
                  <option value="dni">DNI</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="consulta-dni">Número de Identificación *</label>
                <input type="text" id="consulta-dni" className="form-control" placeholder="Ej. 12345678" required maxLength="8" value={consultaDni} onChange={e => setConsultaDni(e.target.value)} />
              </div>
            </div>
            {consultaError && <div className="alert alert-error">{consultaError}</div>}
            <button type="submit" className="btn-primary animated-btn" style={{ width: '100%', marginTop: 15, padding: '0.85rem', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', fontSize: '1rem' }}>
              {buscando ? 'Buscando registros...' : 'Consultar Deuda / Reclamos'}
            </button>
          </form>

          {mostrarResultados && (
            <div id="resultado-busqueda-container" style={{ marginTop: 35 }}>
              <h3 style={{ color: '#003366', marginBottom: 15, fontSize: '1.2rem' }}>Sus Reclamos Registrados</h3>
              <div className="tabla-container">
                <table className="tabla-reclamos">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Tipo Impuesto</th>
                      <th>Motivo</th>
                      <th>Monto (S/)</th>
                      <th>Estado</th>
                      <th>Comprobante</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 15 }}>
                        No se encontraron registros asociados al DNI <strong>{consultaDni}</strong>.
                      </td></tr>
                    ) : resultados.map(r => {
                      const esPagado = r.estado_pago === 'Pagado';
                      const fecha = r.fecha_registro ? new Date(r.fecha_registro).toLocaleDateString('es-PE') : '-';
                      const comp = r.numero_comprobante
                        ? <strong style={{ color: '#003366', fontFamily: 'monospace', fontSize: '0.95rem' }}>{r.numero_comprobante}</strong>
                        : <span style={{ color: '#aaa' }}>-</span>;
                      return (
                        <tr key={r.id}>
                          <td><strong>{r.codigo_seguimiento || '-'}</strong></td>
                          <td>{r.tipo_impuesto || '-'}</td>
                          <td>{r.motivo || '-'}</td>
                          <td><strong style={{ color: '#28a745' }}>S/ {parseFloat(r.monto_calculado || 0).toFixed(2)}</strong></td>
                          <td><span className={`badge badge-${(r.estado || 'registrado').toLowerCase()}`}>{(r.estado || 'REGISTRADO').toUpperCase()}</span></td>
                          <td style={{ textAlign: 'center' }}>{comp}</td>
                          <td style={{ textAlign: 'center' }}>{fecha}</td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                            {esPagado
                              ? <span className="badge-pagado-inline">PAGADO</span>
                              : <Link to={`/pasarela/${r.id}`} className="btn-link-pagar">Pagar Online</Link>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* UBICACIÓN Y CONTACTO */}
      <section id="contacto" className="section-container bg-light">
        <div className="section-title">
          <h2>Ubicación y Canales de Atención</h2>
          <p>Medios de contacto y sedes presenciales del SAT Lima</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Sede Central</h3>
            <p><strong>Dirección:</strong> Jr. Camaná 370, Cercado de Lima, Perú</p>
            <p><strong>Teléfono Alo SAT:</strong> (01) 315-2400</p>
            <p><strong>Atención WhatsApp:</strong> +51 983 744 000</p>
            <p><strong>Correo Institucional:</strong> asuservicio@sat.gob.pe</p>
            <p><strong>Horario:</strong> Lunes a Viernes de 8:00 a.m. a 5:00 p.m.</p>
          </div>
          <div className="contact-branches">
            <h3>Agencias y Depósitos</h3>
            <ul>
              <li><strong>Agencia Argentina:</strong> Av. Argentina 2926, Lima.</li>
              <li><strong>Agencia San Juan de Miraflores:</strong> Av. de los Héroes 638.</li>
              <li><strong>Agencia Los Olivos:</strong> Av. Carlos Izaguirre 813.</li>
              <li><strong>Agencia Surco:</strong> C.C. Jockey Plaza (Tienda CF-B1).</li>
            </ul>
          </div>
        </div>
        <figure className="map-figure">
          <div className="img-container map-img-container">
            <img src="/img/Ubicacion.png" alt="Mapa de ubicación Sede Central SAT" className="adaptive-img" />
          </div>
          <figcaption>Mapa oficial de localización de la Sede Central y cobertura de agencias en Lima.</figcaption>
        </figure>
      </section>

      {/* REGISTRO DE RECLAMO */}
      <section className="section-container form-wrapper" style={{ marginTop: '2rem' }}>
        <div className="section-title">
          <h2>Registro de Reclamo Tributario</h2>
          <p>Ingrese los datos para registrar un reclamo en el sistema del SAT</p>
        </div>

        <form id="form-reclamo" className="sat-form" onSubmit={handleRegistro}>
          <div className="form-group">
            <label htmlFor="reclamo-nombre">Nombre del Propietario *</label>
            <input type="text" id="reclamo-nombre" required placeholder="Ej. Carlos Mendoza"
              value={reclamo.nombre} onChange={e => setReclamo({ ...reclamo, nombre: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reclamo-dni">DNI *</label>
              <input type="text" id="reclamo-dni" maxLength="8" required placeholder="12345678"
                value={reclamo.dni} onChange={e => setReclamo({ ...reclamo, dni: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="reclamo-tipo">Tipo de Impuesto / Infracción *</label>
              <select id="reclamo-tipo" required
                value={reclamo.tipo} onChange={e => setReclamo({ ...reclamo, tipo: e.target.value })}>
                <option value="Predial">Impuesto Predial</option>
                <option value="Vehicular">Impuesto Vehicular</option>
                <option value="Papeleta">Papeleta de Tránsito</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reclamo-motivo">Motivo del Reclamo *</label>
            <textarea id="reclamo-motivo" rows="4" required placeholder="Describa brevemente el motivo de su reclamo..."
              value={reclamo.motivo} onChange={e => setReclamo({ ...reclamo, motivo: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="valor_tasacion">Valor de Tasación del Bien (S/) *</label>
            <input type="number" id="valor_tasacion" step="0.01" min="0" required placeholder="Ej. 50000.00"
              value={reclamo.valor_tasacion} onChange={e => { setReclamo({ ...reclamo, valor_tasacion: e.target.value }); recalcular(e.target.value); }} />
          </div>
          <div className="form-group" style={{ backgroundColor: '#eef6ff', borderLeft: '4px solid #003366', padding: '12px 15px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div>
              <strong style={{ color: '#003366', display: 'block' }}>Derecho de Tramitación:</strong>
              <small style={{ color: '#666' }}>(1.5% del valor de tasación + S/ 12.00 por apertura)</small>
            </div>
            <div id="monto_calculado_display" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#003366' }}>
              S/ {montoCalculado.toFixed(2)}
            </div>
          </div>
          {reclamoError && <div className="alert alert-error">{reclamoError}</div>}
          <button type="submit" className="btn btn-submit animated-btn" style={{ marginTop: '1.5rem' }}>
            <span>{guardando ? 'Guardando en BD...' : 'Registrar Reclamo'}</span>
          </button>
        </form>

        {reclamoMsg && (
          <div id="reclamo-resultado" className="results-container active" style={{ display: 'block', marginTop: '1.5rem', maxWidth: 'none' }}>
            <div className="mock-alert-message">
              <span className="check-icon">&#10004;</span>
              <div>
                <strong>{reclamoMsg}</strong>
                <p>Su código de seguimiento asignado es: <b id="codigo-generado" style={{ fontSize: '1.1rem', color: '#003366' }}>{codigoGenerado}</b></p>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
