import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function PanelCajero() {
  const { usuario, logout } = useAuth();
  const [reclamos, setReclamos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async (filtro = '') => {
    try {
      setError('');
      const res = await api.cajeroReclamos(filtro);
      setReclamos(res.reclamos || []);
    } catch (err) {
      setError('Error al obtener los datos: ' + err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Búsqueda en tiempo real (debounce simple)
  useEffect(() => {
    const t = setTimeout(() => cargar(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda, cargar]);

  const procesarCobro = async (rec) => {
    if (!confirm(`¿Confirmar cobro en efectivo para el reclamo ${rec.codigo_seguimiento} por el monto de S/ ${parseFloat(rec.monto_calculado).toFixed(2)}?`)) return;
    try {
      const res = await api.cobroCaja({ reclamo_id: rec.id, monto: rec.monto_calculado });
      alert(`¡Cobro realizado con éxito!\nNúmero de comprobante emitido: ${res.comprobante}`);
      cargar(busqueda);
    } catch (err) {
      alert('Error al registrar el cobro en caja: ' + err.message);
    }
  };

  return (
    <div className="cajero-container">
      <header className="cajero-header">
        <div className="header-title">
          <h2>Panel de Ventanilla y Cobro en Caja</h2>
          <p>Módulo de Atención Presencial del SAT</p>
        </div>
        <div className="user-info">
          <span id="cajero-nombre">{usuario.nombre} (CAJERO)</span>
          <button id="btn-cerrar-sesion" className="btn-logout" onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      <section className="search-section">
        <input type="text" id="input-busqueda" placeholder="Buscar por DNI, Código de Reclamo o Nombre..."
          value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </section>

      <section className="table-section">
        <h3>Listado General de Reclamos</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>PROPIETARIO</th>
                <th>DNI</th>
                <th>TIPO IMPUESTO</th>
                <th>MOTIVO</th>
                <th>MONTO</th>
                <th>COMPROBANTE</th>
                <th>ESTADO PAGO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody id="tabla-reclamos-cajero">
              {cargando ? (
                <tr><td colSpan={9} className="loading-cell">Cargando registros...</td></tr>
              ) : reclamos.length === 0 ? (
                <tr><td colSpan={9} className="loading-cell">No se encontraron reclamos registrados.</td></tr>
              ) : reclamos.map(r => {
                const esPagado = r.estado_pago === 'Pagado';
                const badgeClass = esPagado ? 'badge-pagado' : 'badge-pendiente';
                return (
                  <tr key={r.id}>
                    <td><strong>{r.codigo_seguimiento}</strong></td>
                    <td>{r.nombre_propietario}</td>
                    <td>{r.dni}</td>
                    <td>{r.tipo_impuesto}</td>
                    <td>{r.motivo}</td>
                    <td><strong>S/ {parseFloat(r.monto_calculado).toFixed(2)}</strong></td>
                    <td>{r.numero_comprobante ? <strong>{r.numero_comprobante}</strong> : <span style={{ color: '#aaa' }}>-</span>}</td>
                    <td><span className={`badge-pago ${badgeClass}`}>{r.estado_pago.toUpperCase()}</span></td>
                    <td>
                      {!esPagado
                        ? <button className="btn-cobrar" onClick={() => procesarCobro(r)}>Cobrar en Caja</button>
                        : <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>Completado</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
