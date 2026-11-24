import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Panel() {
  const { usuario, logout } = useAuth();
  const [reclamos, setReclamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setError('');
      const res = await api.panelReclamos();
      setReclamos(res.reclamos || []);
    } catch (err) {
      setError('Error al cargar reclamos: ' + err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    // Refresco automático cada 15s (RF-33.13)
    const t = setInterval(cargar, 15000);
    return () => clearInterval(t);
  }, [cargar]);

  const cambiarEstado = async (rec) => {
    const nuevoEstado = prompt("Nuevo estado ('registrado', 'atendido', 'rechazado'):", rec.estado);
    if (!nuevoEstado) return;
    const nuevoMotivo = prompt("Actualizar motivo:", rec.motivo);
    if (nuevoMotivo === null) return;
    try {
      await api.panelActualizar(rec.id, { estado: nuevoEstado.toLowerCase(), motivo: nuevoMotivo });
      alert('Registro actualizado con éxito');
      cargar();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  const eliminar = async (rec) => {
    if (!confirm('¿Estás seguro de eliminar este reclamo de la base de datos?')) return;
    try {
      await api.panelEliminar(rec.id);
      alert('Reclamo eliminado correctamente');
      cargar();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  return (
    <div className="panel-container">
      <div className="header-panel">
        <h2>Panel de Administración de Reclamos</h2>
        <div>
          <span id="info-usuario">{usuario.nombre} ({usuario.rol.toUpperCase()})</span>
          <button id="btn-cerrar-sesion" className="btn-logout" onClick={logout}>Cerrar Sesión</button>
        </div>
      </div>

      <h3>Listado General de Reclamos</h3>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="tabla-container">
        <table className="tabla-reclamos">
          <thead>
            <tr>
              <th>Código</th>
              <th>Propietario</th>
              <th>DNI</th>
              <th>Tipo Impuesto</th>
              <th>Motivo</th>
              <th>Estado Trámite</th>
              <th>Estado Pago</th>
              <th>Comprobante</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="tabla-cuerpo">
            {cargando ? (
              <tr><td colSpan={10} style={{ textAlign: 'center' }}>Cargando registros de la base de datos...</td></tr>
            ) : reclamos.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center' }}>No hay reclamos registrados en el sistema.</td></tr>
            ) : reclamos.map(rec => {
              const esPagado = rec.estado_pago === 'Pagado';
              const badgePagoClass = esPagado ? 'badge-pagado' : 'badge-pendiente';
              return (
                <tr key={rec.id}>
                  <td><strong>{rec.codigo_seguimiento}</strong></td>
                  <td>{rec.nombre_propietario}</td>
                  <td>{rec.dni}</td>
                  <td>{rec.tipo_impuesto}</td>
                  <td>{rec.motivo}</td>
                  <td><span className={`badge badge-${rec.estado.toLowerCase()}`}>{rec.estado.toUpperCase()}</span></td>
                  <td><span className={`badge-pago ${badgePagoClass}`}>{(rec.estado_pago || 'PENDIENTE').toUpperCase()}</span></td>
                  <td>{rec.numero_comprobante ? <strong>{rec.numero_comprobante}</strong> : <span style={{ color: '#aaa' }}>-</span>}</td>
                  <td>{new Date(rec.fecha_registro).toLocaleDateString('es-PE')}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-accion btn-editar" onClick={() => cambiarEstado(rec)}>Estado</button>
                    <button className="btn-accion btn-eliminar" onClick={() => eliminar(rec)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
