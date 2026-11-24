// ============================================================
// src/controllers/auth.controller.js
// ============================================================
import { sql } from '../config/db.js';

// POST /api/auth/registro
// Body: { nombre, correo, contrasena, rol }
export async function registrarUsuario(req, res, next) {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ ok: false, error: 'nombre, correo y contrasena son obligatorios' });
    }

    const rolFinal = ['cliente', 'empleado', 'admin', 'cajero'].includes(rol) ? rol : 'empleado';

    // Validar correo duplicado
    const existente = await sql`SELECT id FROM usuarios WHERE correo = ${correo}`;
    if (existente.length > 0) {
      return res.status(409).json({ ok: false, error: 'El correo ya está registrado' });
    }

    const insertado = await sql`
      INSERT INTO usuarios (nombre, correo, contrasena, rol)
      VALUES (${nombre}, ${correo}, ${contrasena}, ${rolFinal})
      RETURNING id, nombre, correo, rol, turno, fecha_registro
    `;

    res.status(201).json({ ok: true, usuario: insertado[0] });
  } catch (e) {
    next(e);
  }
}

// POST /api/auth/login
// Body: { correo, contrasena }
export async function iniciarSesion(req, res, next) {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ ok: false, error: 'correo y contrasena son obligatorios' });
    }

    const filas = await sql`
      SELECT id, nombre, correo, rol, turno, dni FROM usuarios
      WHERE correo = ${correo} AND contrasena = ${contrasena}
    `;

    if (filas.length === 0) {
      return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos' });
    }

    res.json({ ok: true, usuario: filas[0] });
  } catch (e) {
    next(e);
  }
}

// GET /api/auth/perfil  (requiere sesión)
export async function perfil(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'No autenticado' });
    }
    res.json({ ok: true, usuario: req.usuario });
  } catch (e) {
    next(e);
  }
}
