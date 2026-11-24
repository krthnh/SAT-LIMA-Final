// ============================================================
// src/controllers/reclamo.controller.js
// ============================================================
import { sql } from '../config/db.js';

// Mapeo de los alias cortos del formulario a los valores reales de BD.
// (Corrige la inconsistencia del proyecto original: el select de
// registro usaba Predial/Vehicular/Papeleta pero el de consulta usaba
// "Impuesto Predial"/"Impuesto Vehicular"/"Papeleta". Se normaliza todo
// a los valores canónicos del BD).
const TIPO_MAP = {
  'Predial': 'Impuesto Predial',
  'Vehicular': 'Impuesto Vehicular',
  'Papeleta': 'Papeleta',
  'Impuesto Predial': 'Impuesto Predial',
  'Impuesto Vehicular': 'Impuesto Vehicular',
  'Papeleta de Tránsito': 'Papeleta'
};
function normalizarTipo(t) { return TIPO_MAP[t] || t; }

// POST /api/reclamos  — registrar reclamo (cliente logueado)
// Body: { nombre_propietario, dni, tipo_impuesto, motivo, valor_tasacion, monto_calculado }
export async function crearReclamo(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }

    const {
      nombre_propietario, dni, tipo_impuesto, motivo,
      valor_tasacion, monto_calculado
    } = req.body;

    if (!nombre_propietario || !dni || !tipo_impuesto || !motivo) {
      return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' });
    }

    const codigoSeguimiento = 'REC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const vTasacion = parseFloat(valor_tasacion) || 0;
    const montoCalc = parseFloat(monto_calculado) || 12.0;
    const tipoNorm = normalizarTipo(tipo_impuesto);

    const insertado = await sql`
      INSERT INTO reclamos_tributarios (
        codigo_seguimiento, nombre_propietario, dni, tipo_impuesto,
        motivo, valor_tasacion, monto_calculado, estado_pago, estado,
        fecha_registro, usuario_id
      ) VALUES (
        ${codigoSeguimiento}, ${nombre_propietario}, ${dni}, ${tipoNorm},
        ${motivo}, ${vTasacion}, ${montoCalc}, 'Pendiente', 'registrado',
        NOW(), ${req.usuario.id}
      )
      RETURNING id, codigo_seguimiento, estado_pago, estado, fecha_registro
    `;

    res.status(201).json({ ok: true, reclamo: insertado[0] });
  } catch (e) {
    next(e);
  }
}

// GET /api/reclamos/mios  — reclamos del usuario en sesión (RF-33.5)
export async function misReclamos(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    const reclamos = await sql`
      SELECT id, codigo_seguimiento, tipo_impuesto, motivo, valor_tasacion,
             monto_calculado, estado_pago, estado, numero_comprobante, fecha_registro
      FROM reclamos_tributarios
      WHERE usuario_id = ${req.usuario.id}
      ORDER BY fecha_registro DESC
    `;
    res.json({ ok: true, reclamos });
  } catch (e) {
    next(e);
  }
}

// GET /api/reclamos/consulta  — consulta de deuda por DNI (pública)
// Query: ?dni=12345678&tipo=TODOS|Impuesto Predial|Impuesto Vehicular|Papeleta
export async function consultaPublica(req, res, next) {
  try {
    const { dni, tipo } = req.query;
    if (!dni || !/^\d{8}$/.test(String(dni))) {
      return res.status(400).json({ ok: false, error: 'DNI inválido (8 dígitos)' });
    }
    const tipoNorm = tipo && tipo !== 'TODOS' ? normalizarTipo(tipo) : null;

    const reclamos = tipoNorm
      ? await sql`
          SELECT id, codigo_seguimiento, tipo_impuesto, motivo, monto_calculado,
                 estado, estado_pago, numero_comprobante, fecha_registro
          FROM reclamos_tributarios
          WHERE dni = ${dni} AND tipo_impuesto = ${tipoNorm}
          ORDER BY fecha_registro DESC
        `
      : await sql`
          SELECT id, codigo_seguimiento, tipo_impuesto, motivo, monto_calculado,
                 estado, estado_pago, numero_comprobante, fecha_registro
          FROM reclamos_tributarios
          WHERE dni = ${dni}
          ORDER BY fecha_registro DESC
        `;

    res.json({ ok: true, reclamos });
  } catch (e) {
    next(e);
  }
}

// GET /api/reclamos/mios/buscar?dni=...&tipo=...  — consulta privada del cliente
// (filtra por usuario_id Y dni, como en registro.js original)
export async function buscarMisReclamos(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    const { dni, tipo } = req.query;
    if (!dni) {
      return res.status(400).json({ ok: false, error: 'dni es obligatorio' });
    }
    const tipoNorm = tipo && tipo !== 'TODOS' ? normalizarTipo(tipo) : null;

    const reclamos = tipoNorm
      ? await sql`
          SELECT id, codigo_seguimiento, tipo_impuesto, motivo, valor_tasacion,
                 monto_calculado, estado_pago, estado, numero_comprobante, fecha_registro
          FROM reclamos_tributarios
          WHERE usuario_id = ${req.usuario.id}
            AND dni = ${dni}
            AND tipo_impuesto = ${tipoNorm}
          ORDER BY fecha_registro DESC
        `
      : await sql`
          SELECT id, codigo_seguimiento, tipo_impuesto, motivo, valor_tasacion,
                 monto_calculado, estado_pago, estado, numero_comprobante, fecha_registro
          FROM reclamos_tributarios
          WHERE usuario_id = ${req.usuario.id} AND dni = ${dni}
          ORDER BY fecha_registro DESC
        `;

    res.json({ ok: true, reclamos });
  } catch (e) {
    next(e);
  }
}

// GET /api/reclamos/:id  — detalle de un reclamo (para pasarela)
export async function obtenerReclamo(req, res, next) {
  try {
    const { id } = req.params;
    const [reclamo] = await sql`
      SELECT id, codigo_seguimiento, tipo_impuesto, motivo, valor_tasacion,
             monto_calculado, estado_pago, estado, numero_comprobante,
             fecha_registro, usuario_id, dni, nombre_propietario
      FROM reclamos_tributarios
      WHERE id = ${id}
    `;
    if (!reclamo) {
      return res.status(404).json({ ok: false, error: 'Reclamo no encontrado' });
    }
    res.json({ ok: true, reclamo });
  } catch (e) {
    next(e);
  }
}

// PUT /api/reclamos/:id  — editar reclamo propio (solo estado 'registrado')
// Body: { motivo, tipo_impuesto? }
export async function editarReclamoPropio(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    const { id } = req.params;
    const { motivo, tipo_impuesto } = req.body;

    const resultado = tipo_impuesto
      ? await sql`
          UPDATE reclamos_tributarios
          SET tipo_impuesto = ${normalizarTipo(tipo_impuesto)}, motivo = ${motivo}
          WHERE id = ${id} AND usuario_id = ${req.usuario.id} AND estado = 'registrado'
          RETURNING id, codigo_seguimiento, motivo, tipo_impuesto
        `
      : await sql`
          UPDATE reclamos_tributarios
          SET motivo = ${motivo}
          WHERE id = ${id} AND usuario_id = ${req.usuario.id} AND estado = 'registrado'
          RETURNING id, codigo_seguimiento, motivo
        `;

    if (resultado.length === 0) {
      return res.status(409).json({
        ok: false,
        error: 'No se pudo editar: el reclamo no existe, no le pertenece o ya no está en estado registrado'
      });
    }
    res.json({ ok: true, reclamo: resultado[0] });
  } catch (e) {
    next(e);
  }
}
