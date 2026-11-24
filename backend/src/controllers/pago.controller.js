// ============================================================
// src/controllers/pago.controller.js
// ============================================================
import { sql } from '../config/db.js';

// POST /api/pagos/tarjeta  — pagar con tarjeta crédito/débito
// Body: { reclamo_id, marca, numero, titular, dni, tipo, mes, anio, cuotas? }
export async function pagarConTarjeta(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    const {
      reclamo_id, marca, numero, titular, dni, tipo, mes, anio, cuotas
    } = req.body;

    // --- Validaciones ---
    if (!reclamo_id || !numero || !titular || !dni || !tipo || !mes || !anio || !marca) {
      return res.status(400).json({ ok: false, error: 'Faltan datos de la tarjeta' });
    }
    if (String(numero).length !== 16 || isNaN(numero)) {
      return res.status(400).json({ ok: false, error: 'Número de tarjeta inválido (16 dígitos)' });
    }
    if (String(dni).length !== 8 || isNaN(dni)) {
      return res.status(400).json({ ok: false, error: 'DNI inválido (8 dígitos)' });
    }
    const mesNum = parseInt(mes, 10);
    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ ok: false, error: 'Mes de expiración inválido (1-12)' });
    }
    const mesFormateado = String(mesNum).padStart(2, '0');
    if (String(anio).length !== 2 || isNaN(anio)) {
      return res.status(400).json({ ok: false, error: 'Año de expiración inválido (2 dígitos)' });
    }
    if (!['Credito', 'Debito'].includes(tipo)) {
      return res.status(400).json({ ok: false, error: 'tipo debe ser Credito o Debito' });
    }

    const nCuotas = tipo === 'Credito'
      ? Math.max(1, parseInt(cuotas, 10) || 1)
      : 1;

    // --- Cargar reclamo pendiente ---
    const [reclamo] = await sql`
      SELECT id, codigo_seguimiento, monto_calculado FROM reclamos_tributarios
      WHERE id = ${reclamo_id} AND estado_pago = 'Pendiente'
    `;
    if (!reclamo) {
      return res.status(404).json({ ok: false, error: 'El reclamo no existe o ya fue pagado' });
    }

    // --- Validar/autoregistrar tarjeta ---
    let [tarjeta] = await sql`
      SELECT id FROM banco_tarjetas
      WHERE numero_tarjeta = ${numero}
        AND mes_expiracion = ${mesFormateado}
        AND anio_expiracion = ${anio}
    `;
    if (!tarjeta) {
      const [nueva] = await sql`
        INSERT INTO banco_tarjetas (
          numero_tarjeta, mes_expiracion, anio_expiracion,
          nombre_titular, tipo_tarjeta, numero_cuotas,
          dni_titular, marca_tarjeta
        ) VALUES (
          ${numero}, ${mesFormateado}, ${anio},
          ${titular.toUpperCase()}, ${tipo}, ${nCuotas},
          ${dni}, ${marca}
        ) RETURNING id
      `;
      tarjeta = nueva;
    }

    const detalle = tipo === 'Credito'
      ? `Tarjeta ${marca} Crédito (${nCuotas} ${nCuotas > 1 ? 'cuotas' : 'cuota'})`
      : `Tarjeta ${marca} Débito`;

    const comprobante = await registrarPago(reclamo.id, reclamo.monto_calculado, detalle);

    res.json({
      ok: true,
      mensaje: 'Pago procesado con éxito',
      comprobante,
      tarjeta_id: tarjeta.id
    });
  } catch (e) {
    next(e);
  }
}

// POST /api/pagos/billetera  — pagar con Yape/Plin
// Body: { reclamo_id, tipo, celular }
export async function pagarConBilletera(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    const { reclamo_id, tipo, celular } = req.body;
    if (!reclamo_id || !tipo || !celular) {
      return res.status(400).json({ ok: false, error: 'Faltan datos de la billetera' });
    }
    if (!['YAPE', 'PLIN'].includes(tipo)) {
      return res.status(400).json({ ok: false, error: 'tipo debe ser YAPE o PLIN' });
    }
    if (String(celular).length !== 9 || isNaN(celular)) {
      return res.status(400).json({ ok: false, error: 'Celular inválido (9 dígitos)' });
    }

    const [reclamo] = await sql`
      SELECT id, codigo_seguimiento, monto_calculado FROM reclamos_tributarios
      WHERE id = ${reclamo_id} AND estado_pago = 'Pendiente'
    `;
    if (!reclamo) {
      return res.status(404).json({ ok: false, error: 'El reclamo no existe o ya fue pagado' });
    }

    // Validar/autoregistrar billetera.
    // OJO: la constraint UNIQUE de la tabla es sobre numero_celular SOLA
    // (no incluye tipo). Corregimos el bug del proyecto original que asumía
    // unicidad compuesta (numero_celular + tipo).
    let [billetera] = await sql`
      SELECT id FROM billeteras
      WHERE numero_celular = ${celular}
    `;
    if (!billetera) {
      const [nueva] = await sql`
        INSERT INTO billeteras (numero_celular, tipo)
        VALUES (${celular}, ${tipo}) RETURNING id
      `;
      billetera = nueva;
    }

    const detalle = `Billetera (${tipo})`;
    const comprobante = await registrarPago(reclamo.id, reclamo.monto_calculado, detalle);

    res.json({
      ok: true,
      mensaje: 'Pago procesado con éxito',
      comprobante,
      billetera_id: billetera.id
    });
  } catch (e) {
    next(e);
  }
}

// POST /api/pagos/caja  — cobro presencial (cajero/admin)
// Body: { reclamo_id, monto }
export async function cobroCaja(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['cajero', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido a cajero o admin' });
    }

    const { reclamo_id, monto } = req.body;
    if (!reclamo_id || monto == null) {
      return res.status(400).json({ ok: false, error: 'reclamo_id y monto son obligatorios' });
    }

    const [reclamo] = await sql`
      SELECT id, codigo_seguimiento, monto_calculado, estado_pago FROM reclamos_tributarios
      WHERE id = ${reclamo_id}
    `;
    if (!reclamo) {
      return res.status(404).json({ ok: false, error: 'Reclamo no encontrado' });
    }
    if (reclamo.estado_pago === 'Pagado') {
      return res.status(409).json({ ok: false, error: 'El reclamo ya está pagado' });
    }

    const comprobante = await registrarPago(reclamo.id, monto, 'Cobro Presencial en Caja');

    res.json({
      ok: true,
      mensaje: 'Cobro en caja realizado con éxito',
      comprobante
    });
  } catch (e) {
    next(e);
  }
}

// GET /api/pagos  — listado de pagos (solo admin/cajero)
export async function listarPagos(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['cajero', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido' });
    }
    const pagos = await sql`
      SELECT p.id, p.reclamo_id, p.monto, p.medio_pago, p.numero_comprobante, p.fecha_pago,
             r.codigo_seguimiento
      FROM pagos p
      LEFT JOIN reclamos_tributarios r ON p.reclamo_id = r.id
      ORDER BY p.fecha_pago DESC
      LIMIT 200
    `;
    res.json({ ok: true, pagos });
  } catch (e) {
    next(e);
  }
}

// Helper interno: registra el pago y actualiza el reclamo
async function registrarPago(reclamoId, monto, medioPago) {
  const numComprobante = 'CMP-VS-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  await sql`
    INSERT INTO pagos (reclamo_id, monto, medio_pago, numero_comprobante, fecha_pago)
    VALUES (${reclamoId}, ${monto}, ${medioPago}, ${numComprobante}, NOW())
  `;
  await sql`
    UPDATE reclamos_tributarios
    SET estado_pago = 'Pagado',
        fecha_pago = NOW(),
        numero_comprobante = ${numComprobante}
    WHERE id = ${reclamoId}
  `;
  return numComprobante;
}
