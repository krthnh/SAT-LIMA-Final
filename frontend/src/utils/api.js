// ============================================================
// src/utils/api.js
// Cliente HTTP para el backend. Adjunta el id de usuario en
// cada petición a través del header x-user-id (igual que el
// middleware attachUser del backend).
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');
  return usuario ? { 'x-user-id': String(usuario.id) } : {};
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, opts);
  } catch (e) {
    throw new Error(`No se pudo conectar con el servidor (${API_URL}). ¿Está el backend activo?`);
  }

  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const msg = data?.error || `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  registro: (payload) => request('POST', '/api/auth/registro', payload),
  login: (payload) => request('POST', '/api/auth/login', payload),

  // Reclamos
  crearReclamo: (payload) => request('POST', '/api/reclamos', payload),
  misReclamos: () => request('GET', '/api/reclamos/mios'),
  buscarMisReclamos: (dni, tipo) =>
    request('GET', `/api/reclamos/mios/buscar?dni=${encodeURIComponent(dni)}&tipo=${encodeURIComponent(tipo)}`),
  consultaPublica: (dni, tipo) =>
    request('GET', `/api/reclamos/consulta?dni=${encodeURIComponent(dni)}&tipo=${encodeURIComponent(tipo)}`),
  obtenerReclamo: (id) => request('GET', `/api/reclamos/${id}`),
  editarReclamo: (id, payload) => request('PUT', `/api/reclamos/${id}`, payload),

  // Pagos
  pagarTarjeta: (payload) => request('POST', '/api/pagos/tarjeta', payload),
  pagarBilletera: (payload) => request('POST', '/api/pagos/billetera', payload),
  cobroCaja: (payload) => request('POST', '/api/pagos/caja', payload),
  listarPagos: () => request('GET', '/api/pagos'),

  // Panel admin/empleado
  panelReclamos: () => request('GET', '/api/panel/reclamos'),
  panelActualizar: (id, payload) => request('PUT', `/api/panel/reclamos/${id}`, payload),
  panelEliminar: (id) => request('DELETE', `/api/panel/reclamos/${id}`),

  // Cajero
  cajeroReclamos: (q) => request('GET', `/api/cajero/reclamos${q ? '?q=' + encodeURIComponent(q) : ''}`),

  // Tarifario
  tarifario: (valor) => request('GET', `/api/tarifario/calcular?valor_tasacion=${encodeURIComponent(valor)}`),

  // Health
  health: () => request('GET', '/api/health')
};
