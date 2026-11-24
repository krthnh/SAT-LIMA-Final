// ============================================================
// src/controllers/panel.controller.js  (admin / empleado)
// ============================================================
import { sql } from '../config/db.js';

// GET /api/panel/reclamos
// - admin: todos los reclamos
// - empleado: reclamos filtrados por su turno (hora de registro)
export async function listarReclamosPanel(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['admin', 'empleado'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido a admin o empleado' });
    }

    const baseSelect = `
      SELECT r.id, r.codigo_seguimiento, r.nombre_propietario, r.dni,
             r.tipo_impuesto, r.motivo, r.estado, r.estado_pago,
             r.numero_comprobante, r.fecha_registro,
             u.nombre AS registrado_por
      FROM reclamos_tributarios r
      LEFT JOIN usuarios u ON r.usuario_id = u.id
    `;

    let reclamos = [];
    if (req.usuario.rol === 'admin') {
      reclamos = await sql(`
        ${baseSelect}
        ORDER BY r.fecha_registro DESC
      `);
    } else {
      // empleado: filtrar por turno
      const turno = (req.usuario.turno || '').toLowerCase().trim();
      if (turno === 'madrugada') {
        reclamos = await sql(`
          ${baseSelect}
          WHERE EXTRACT(HOUR FROM r.fecha_registro) >= 0
            AND EXTRACT(HOUR FROM r.fecha_registro) < 8
          ORDER BY r.fecha_registro DESC
        `);
      } else if (turno === 'manana') {
        reclamos = await sql(`
          ${baseSelect}
          WHERE EXTRACT(HOUR FROM r.fecha_registro) >= 8
            AND EXTRACT(HOUR FROM r.fecha_registro) < 16
          ORDER BY r.fecha_registro DESC
        `);
      } else if (turno === 'noche') {
        reclamos = await sql(`
          ${baseSelect}
          WHERE EXTRACT(HOUR FROM r.fecha_registro) >= 16
            AND EXTRACT(HOUR FROM r.fecha_registro) < 24
          ORDER BY r.fecha_registro DESC
        `);
      } else {
        // Sin turno asignado → no ve ninguno (igual que el original)
        reclamos = [];
      }
    }

    res.json({ ok: true, reclamos });
  } catch (e) {
    next(e);
  }
}

// PUT /api/panel/reclamos/:id  — cambiar estado y motivo
// Body: { estado, motivo }
export async function actualizarEstadoReclamo(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['admin', 'empleado'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido' });
    }

    const { id } = req.params;
    const { estado, motivo } = req.body;
    const estadosValidos = ['registrado', 'atendido', 'rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, error: `estado debe ser uno de: ${estadosValidos.join(', ')}` });
    }
    if (motivo == null) {
      return res.status(400).json({ ok: false, error: 'motivo es obligatorio' });
    }

    const resultado = await sql`
      UPDATE reclamos_tributarios
      SET estado = ${estado}, motivo = ${motivo}
      WHERE id = ${id}
      RETURNING id, codigo_seguimiento, estado, motivo
    `;
    if (resultado.length === 0) {
      return res.status(404).json({ ok: false, error: 'Reclamo no encontrado' });
    }
    res.json({ ok: true, reclamo: resultado[0] });
  } catch (e) {
    next(e);
  }
}

// DELETE /api/panel/reclamos/:id  — eliminar reclamo
export async function eliminarReclamo(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!['admin', 'empleado'].includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, error: 'Acceso restringido' });
    }

    const { id } = req.params;
    const resultado = await sql`
      DELETE FROM reclamos_tributarios WHERE id = ${id} RETURNING id
    `;
    if (resultado.length === 0) {
      return res.status(404).json({ ok: false, error: 'Reclamo no encontrado' });
    }
    res.json({ ok: true, eliminado: id });
  } catch (e) {
    next(e);
  }
}
