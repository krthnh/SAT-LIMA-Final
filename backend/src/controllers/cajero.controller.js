// ============================================================
// src/controllers/cajero.controller.js
// ============================================================
import { sql } from '../config/db.js';

// GET /api/cajero/reclamos?q=  — búsqueda ILIKE por código/dni/nombre
export async function listarReclamosCaja(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['cajero', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido a cajero o admin' });
    }

    const q = (req.query.q || '').trim();
    let reclamos;
    if (q) {
      const termino = `%${q}%`;
      reclamos = await sql`
        SELECT id, codigo_seguimiento, nombre_propietario, dni, tipo_impuesto,
               motivo, monto_calculado, estado_pago, numero_comprobante, fecha_registro
        FROM reclamos_tributarios
        WHERE codigo_seguimiento ILIKE ${termino}
           OR dni ILIKE ${termino}
           OR nombre_propietario ILIKE ${termino}
        ORDER BY id DESC
      `;
    } else {
      reclamos = await sql`
        SELECT id, codigo_seguimiento, nombre_propietario, dni, tipo_impuesto,
               motivo, monto_calculado, estado_pago, numero_comprobante, fecha_registro
        FROM reclamos_tributarios
        ORDER BY id DESC
      `;
    }
    res.json({ ok: true, reclamos });
  } catch (e) {
    next(e);
  }
}
