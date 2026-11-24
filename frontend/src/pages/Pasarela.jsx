import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Pasarela() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [reclamo, setReclamo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medio, setMedio] = useState('tarjeta');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [procesando, setProcesando] = useState(false);

  // Tarjeta
  const [tarjeta, setTarjeta] = useState({
    marca: 'Visa', numero: '', titular: '', dni: '', tipo: 'Debito',
    mes: '', anio: '', cuotas: 1
  });

  // Billetera
  const [billetera, setBilletera] = useState({ tipo: 'YAPE', celular: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.obtenerReclamo(id);
        if (!res.reclamo) {
          setMsg({ text: 'Reclamo no encontrado.', type: 'error' });
        } else if (res.reclamo.estado_pago !== 'Pendiente') {
          setMsg({ text: 'El reclamo ya ha sido pagado.', type: 'error' });
        } else {
          setReclamo(res.reclamo);
        }
      } catch (err) {
        setMsg({ text: 'Error al cargar reclamo: ' + err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const lanzarConfeti = () => {
    if (typeof window.confetti !== 'function') return;
    const duracion = 2500;
    const final = Date.now() + duracion;
    const interval = setInterval(() => {
      const rest = final - Date.now();
      if (rest <= 0) return clearInterval(interval);
      const n = 50 * (rest / duracion);
      window.confetti({ particleCount: n, angle: 60, spread: 55, origin: { x: 0, y: 0.85 }, colors: ['#28a745', '#0056b3', '#ffc107', '#dc3545', '#17a2b8'] });
      window.confetti({ particleCount: n, angle: 120, spread: 55, origin: { x: 1, y: 0.85 }, colors: ['#28a745', '#0056b3', '#ffc107', '#dc3545', '#17a2b8'] });
    }, 250);
  };

  const cargarConfetti = () => {
    if (!window.confetti) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js';
      document.head.appendChild(s);
    }
  };

  useEffect(() => { cargarConfetti(); }, []);

  const handleTarjeta = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMsg({ text: 'Validando tarjeta con la entidad bancaria...', type: 'warning' });

    // Validaciones
    if (tarjeta.numero.length !== 16 || isNaN(tarjeta.numero)) {
      setMsg({ text: 'Número de tarjeta inválido (requiere 16 dígitos).', type: 'error' });
      setProcesando(false);
      return;
    }
    if (tarjeta.dni.length !== 8 || isNaN(tarjeta.dni)) {
      setMsg({ text: 'DNI inválido (requiere 8 dígitos).', type: 'error' });
      setProcesando(false);
      return;
    }
    const mesNum = parseInt(tarjeta.mes, 10);
    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      setMsg({ text: 'El mes de expiración debe ser un número entre 1 y 12.', type: 'error' });
      setProcesando(false);
      return;
    }
    if (tarjeta.anio.length !== 2 || isNaN(tarjeta.anio)) {
      setMsg({ text: 'Año de expiración inválido (2 dígitos).', type: 'error' });
      setProcesando(false);
      return;
    }

    try {
      setMsg({ text: 'Autorizado. Registrando pago en el sistema del SAT...', type: 'info' });
      const res = await api.pagarTarjeta({
        reclamo_id: Number(id),
        marca: tarjeta.marca,
        numero: tarjeta.numero,
        titular: tarjeta.titular.toUpperCase(),
        dni: tarjeta.dni,
        tipo: tarjeta.tipo,
        mes: tarjeta.mes,
        anio: tarjeta.anio,
        cuotas: tarjeta.tipo === 'Credito' ? tarjeta.cuotas : 1
      });
      lanzarConfeti();
      setMsg({ text: `¡Pago exitoso! Comprobante: ${res.comprobante}. Redirigiendo...`, type: 'success' });
      setTimeout(() => navigate('/'), 3500);
    } catch (err) {
      setMsg({ text: 'Error de Autorización: ' + err.message, type: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  const handleBilletera = async (e) => {
    e.preventDefault();
    setProcesando(true);
    setMsg({ text: `Verificando cuenta en ${billetera.tipo}...`, type: 'warning' });

    if (billetera.celular.length !== 9 || isNaN(billetera.celular)) {
      setMsg({ text: 'Número de celular inválido (requiere 9 dígitos).', type: 'error' });
      setProcesando(false);
      return;
    }

    try {
      setMsg({ text: 'Autorizado. Registrando pago en el sistema del SAT...', type: 'info' });
      const res = await api.pagarBilletera({
        reclamo_id: Number(id),
        tipo: billetera.tipo,
        celular: billetera.celular
      });
      lanzarConfeti();
      setMsg({ text: `¡Pago exitoso! Comprobante: ${res.comprobante}. Redirigiendo...`, type: 'success' });
      setTimeout(() => navigate('/'), 3500);
    } catch (err) {
      setMsg({ text: 'Error de Autorización: ' + err.message, type: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <div className="section-container"><p style={{ textAlign: 'center' }}>Cargando reclamo...</p></div>;

  if (!reclamo) {
    return (
      <div className="pasarela-container">
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'warning'}`}>{msg.text || 'No se especificó un expediente válido.'}</div>
        <button className="btn-pagar" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    );
  }

  return (
    <div className="pasarela-container">
      <div className="pasarela-header">
        <h2>Pasarela de Pagos SAT</h2>
        <p>Complete su pago en línea de forma rápida y segura</p>
      </div>

      <div className="resumen-cobro">
        <div><strong>Código de Reclamo:</strong> <span>{reclamo.codigo_seguimiento}</span></div>
        <div><strong>Total a Pagar:</strong> <span className="monto-destacado">S/ {parseFloat(reclamo.monto_calculado).toFixed(2)}</span></div>
      </div>

      <div className="metodo-pago-selector">
        <label className="metodo-option">
          <input type="radio" name="medio_pago" value="tarjeta" checked={medio === 'tarjeta'} onChange={() => setMedio('tarjeta')} />
          <span>Tarjeta de Crédito / Débito</span>
        </label>
        <label className="metodo-option">
          <input type="radio" name="medio_pago" value="billetera" checked={medio === 'billetera'} onChange={() => setMedio('billetera')} />
          <span>Billeteras Digitales (Yape / Plin)</span>
        </label>
      </div>

      {medio === 'tarjeta' && (
        <form id="form-pago-tarjeta" className="form-metodo active" onSubmit={handleTarjeta}>
          <div className="form-group">
            <label htmlFor="tarjeta-marca">Marca de Tarjeta</label>
            <select id="tarjeta-marca" className="form-control" required value={tarjeta.marca} onChange={e => setTarjeta({ ...tarjeta, marca: e.target.value })}>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="AmericanExpress">American Express</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tarjeta-numero">Número de Tarjeta (16 dígitos)</label>
            <input type="text" id="tarjeta-numero" maxLength="16" placeholder="4557 0000 0000 0000" required value={tarjeta.numero} onChange={e => setTarjeta({ ...tarjeta, numero: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="tarjeta-titular">Nombre Completo del Titular</label>
            <input type="text" id="tarjeta-titular" placeholder="Ej. CLAUDIA ROJAS" required value={tarjeta.titular} onChange={e => setTarjeta({ ...tarjeta, titular: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tarjeta-dni">DNI del Titular</label>
              <input type="text" id="tarjeta-dni" maxLength="8" placeholder="85214796" required value={tarjeta.dni} onChange={e => setTarjeta({ ...tarjeta, dni: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="tarjeta-tipo">Tipo de Tarjeta</label>
              <select id="tarjeta-tipo" className="form-control" required value={tarjeta.tipo} onChange={e => setTarjeta({ ...tarjeta, tipo: e.target.value })}>
                <option value="Debito">Débito</option>
                <option value="Credito">Crédito</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tarjeta-mes">Mes Exp. (MM)</label>
              <input type="text" id="tarjeta-mes" maxLength="2" placeholder="12" required value={tarjeta.mes} onChange={e => setTarjeta({ ...tarjeta, mes: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="form-group">
              <label htmlFor="tarjeta-anio">Año Exp. (AA)</label>
              <input type="text" id="tarjeta-anio" maxLength="2" placeholder="28" required value={tarjeta.anio} onChange={e => setTarjeta({ ...tarjeta, anio: e.target.value })} />
            </div>
            {tarjeta.tipo === 'Credito' && (
              <div className="form-group">
                <label htmlFor="tarjeta-cuotas">N° Cuotas</label>
                <input type="number" id="tarjeta-cuotas" min="1" max="36" value={tarjeta.cuotas} onChange={e => setTarjeta({ ...tarjeta, cuotas: e.target.value })} />
              </div>
            )}
          </div>
          <button type="submit" className="btn-pagar" disabled={procesando}>{procesando ? 'Procesando...' : 'Pagar con Tarjeta'}</button>
        </form>
      )}

      {medio === 'billetera' && (
        <form id="form-pago-billetera" className="form-metodo" onSubmit={handleBilletera}>
          <div className="form-group">
            <label htmlFor="billetera-tipo">Seleccionar Billetera</label>
            <select id="billetera-tipo" className="form-control" required value={billetera.tipo} onChange={e => setBilletera({ ...billetera, tipo: e.target.value })}>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="billetera-celular">Número Celular Registrado (9 dígitos)</label>
            <input type="text" id="billetera-celular" maxLength="9" placeholder="956232458" required value={billetera.celular} onChange={e => setBilletera({ ...billetera, celular: e.target.value })} />
          </div>
          <button type="submit" className="btn-pagar" disabled={procesando}>{procesando ? 'Procesando...' : 'Autorizar y Pagar'}</button>
        </form>
      )}

      {msg.text && (
        <div className={`mensaje-alerta alert-${msg.type === 'success' ? 'success' : msg.type === 'error' ? 'error' : msg.type === 'info' ? 'info' : 'warning'}`}
          style={{ backgroundColor: msg.type === 'success' ? '#d4edda' : msg.type === 'error' ? '#f8d7da' : msg.type === 'info' ? '#d1ecf1' : '#fff3cd', color: msg.type === 'success' ? '#155724' : msg.type === 'error' ? '#721c24' : msg.type === 'info' ? '#0c5460' : '#856404' }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
