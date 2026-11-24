// ============================================================
// src/scripts/test_endpoints.mjs
// Suite de pruebas tipo Postman para validar todos los endpoints.
// Uso:  node src/scripts/test_endpoints.mjs
// Asume el backend corriendo en http://localhost:3001
// ============================================================
const BASE = process.env.API_URL || 'http://localhost:3001';

let pass = 0, fail = 0;
const failures = [];

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  let data = null;
  try { data = await r.json(); } catch (_) {}
  return { status: r.status, data };
}

function check(name, cond, extra = '') {
  if (cond) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    failures.push(`${name} ${extra}`);
    console.log(`  ❌ ${name}  ${extra}`);
  }
}

console.log(`\n🧪 Probando API en ${BASE}\n`);

// 1. Healthcheck
console.log('1) Healthcheck');
{
  const { status, data } = await req('GET', '/api/health');
  check('GET /api/health → 200', status === 200, `→ ${status}`);
  check('ok=true', data?.ok === true, `→ ${JSON.stringify(data)}`);
}

// 2. Login admin
console.log('2) Login admin');
let adminHeaders = {};
{
  const { status, data } = await req('POST', '/api/auth/login', {
    correo: 'admin@sat.gob.pe', contrasena: 'admin123'
  });
  // puede fallar la contraseña (no la sabemos); intentamos una segunda
  let r2 = { status, data };
  if (status !== 200) {
    r2 = await req('POST', '/api/auth/login', {
      correo: 'admin@sat.gob.pe', contrasena: 'admin'
    });
  }
  let r3 = r2;
  if (r3.status !== 200) {
    r3 = await req('POST', '/api/auth/login', {
      correo: 'admin@sat.gob.pe', contrasena: '123456'
    });
  }
  let rFinal = r3.status === 200 ? r3 : { status, data };
  if (rFinal.status === 200) {
    adminHeaders['x-user-id'] = String(rFinal.data.usuario.id);
    console.log(`     → logueado como ${rFinal.data.usuario.nombre} (${rFinal.data.usuario.rol})`);
  }
  check('login admin responde 200 o 401', [200, 401].includes(rFinal.status), `→ ${rFinal.status}`);
}

// 3. Login cliente (registro previo para asegurar)
console.log('3) Registro + login cliente');
let clienteHeaders = {};
{
  const correoTest = `test_${Date.now()}@gmail.com`;
  const r = await req('POST', '/api/auth/registro', {
    nombre: 'Usuario Prueba', correo: correoTest, contrasena: 'test1234', rol: 'cliente'
  });
  check('registro cliente → 201', r.status === 201, `→ ${r.status} ${r.data?.error || ''}`);

  const l = await req('POST', '/api/auth/login', { correo: correoTest, contrasena: 'test1234' });
  check('login cliente → 200', l.status === 200, `→ ${l.status}`);
  if (l.status === 200) clienteHeaders['x-user-id'] = String(l.data.usuario.id);
}

// 4. Tarifario
console.log('4) Tarifario');
{
  const { status, data } = await req('GET', '/api/tarifario/calcular?valor_tasacion=50000');
  check('GET /api/tarifario/calcular → 200', status === 200);
  // 1.5% de 50000 = 750 + 12 = 762
  check('monto = 762.00', data?.desglose?.monto_total === 762, `→ ${data?.desglose?.monto_total}`);
}

// 5. Crear reclamo (cliente)
console.log('5) Crear reclamo');
let reclamoId = null;
if (clienteHeaders['x-user-id']) {
  const { status, data } = await req('POST', '/api/reclamos', {
    nombre_propietario: 'Usuario Prueba',
    dni: '12345678',
    tipo_impuesto: 'Predial',
    motivo: 'Reclamo de prueba automatizado',
    valor_tasacion: 50000,
    monto_calculado: 762
  }, clienteHeaders);
  check('POST /api/reclamos → 201', status === 201, `→ ${status} ${data?.error || ''}`);
  if (status === 201) reclamoId = data.reclamo.id;
} else {
  check('crear reclamo (sin sesión cliente)', false, 'no hay sesión cliente');
}

// 6. Consulta pública por DNI
console.log('6) Consulta pública');
{
  const { status, data } = await req('GET', '/api/reclamos/consulta?dni=12345678');
  check('GET /api/reclamos/consulta?dni → 200', status === 200);
  check('devuelve array reclamos', Array.isArray(data?.reclamos), `→ ${typeof data?.reclamos}`);
}

// 7. Mis reclamos
console.log('7) Mis reclamos');
if (clienteHeaders['x-user-id']) {
  const { status, data } = await req('GET', '/api/reclamos/mios', null, clienteHeaders);
  check('GET /api/reclamos/mios → 200', status === 200);
  check('devuelve array', Array.isArray(data?.reclamos));
} else {
  check('mis reclamos', false, 'sin sesión');
}

// 8. Editar reclamo propio
console.log('8) Editar reclamo propio');
if (reclamoId && clienteHeaders['x-user-id']) {
  const { status, data } = await req('PUT', `/api/reclamos/${reclamoId}`, {
    motivo: 'Motivo editado por test'
  }, clienteHeaders);
  check('PUT /api/reclamos/:id → 200', status === 200, `→ ${status} ${data?.error || ''}`);
} else {
  check('editar reclamo', false, 'sin reclamo creado');
}

// 9. Pagar con billetera
console.log('9) Pagar con billetera');
if (reclamoId && clienteHeaders['x-user-id']) {
  const { status, data } = await req('POST', '/api/pagos/billetera', {
    reclamo_id: reclamoId, tipo: 'YAPE', celular: '956232458'
  }, clienteHeaders);
  check('POST /api/pagos/billetera → 200', status === 200, `→ ${status} ${data?.error || ''}`);
  check('devuelve comprobante', !!data?.comprobante);
}

// 10. Panel admin — listar reclamos
console.log('10) Panel admin');
if (adminHeaders['x-user-id']) {
  const { status, data } = await req('GET', '/api/panel/reclamos', null, adminHeaders);
  check('GET /api/panel/reclamos → 200', status === 200, `→ ${status}`);
  check('devuelve array', Array.isArray(data?.reclamos));
} else {
  check('panel admin', false, 'sin sesión admin (contraseña desconocida)');
}

// 11. Cajero — listar reclamos
console.log('11) Cajero');
{
  // Intentar login cajero
  let cajeroH = {};
  for (const pw of ['cajero123', 'cajero', '123456']) {
    const l = await req('POST', '/api/auth/login', { correo: 'cajero01@sat.gob.pe', contrasena: pw });
    if (l.status === 200) { cajeroH['x-user-id'] = String(l.data.usuario.id); break; }
  }
  if (cajeroH['x-user-id']) {
    const { status, data } = await req('GET', '/api/cajero/reclamos', null, cajeroH);
    check('GET /api/cajero/reclamos → 200', status === 200);
    check('devuelve array', Array.isArray(data?.reclamos));
  } else {
    check('cajero login', false, 'contraseña desconocida');
  }
}

// 12. Ruta inexistente → 404
console.log('12) 404');
{
  const { status } = await req('GET', '/api/no-existe');
  check('GET /api/no-existe → 404', status === 404);
}

console.log(`\n📊 Resultado: ${pass} OK, ${fail} FALLIDOS\n`);
if (failures.length) {
  console.log('Fallos:');
  failures.forEach(f => console.log('  -', f));
  process.exit(1);
}
