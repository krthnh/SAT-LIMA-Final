// ============================================================
// src/middleware/errorMiddleware.js
// ============================================================
export function notFound(req, res, next) {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error('🔴 Error no controlado:', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Error interno del servidor'
  });
}

// ============================================================
// Middleware de sesión simulada: lee un header
//   x-user-id  /  x-user-rol
// o un header Authorization: Bearer <idUsuario>
// y adjunta req.usuario = { id, rol, nombre, turno }
// No es JWT real: la migración conserva la lógica original
// (el frontend guardaba el usuario en sessionStorage y mandaba
// peticiones directas). Aquí lo normalizamos como middleware.
// ============================================================
import { sql } from '../config/db.js';

export async function attachUser(req, res, next) {
  try {
    let userId = req.headers['x-user-id'] ||
                 (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);

    if (!userId) {
      // Permite rutas públicas: req.usuario queda undefined.
      req.usuario = null;
      return next();
    }

    userId = String(userId).trim();
    const [user] = await sql`
      SELECT id, nombre, correo, rol, turno, dni FROM usuarios WHERE id = ${userId}
    `;
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Usuario no válido' });
    }
    req.usuario = user;
    next();
  } catch (e) {
    next(e);
  }
}

// Requiere sesión activa
export function requireAuth(req, res, next) {
  if (!req.usuario) {
    return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
  }
  next();
}

// Requiere uno de los roles pasados como argumentos
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ ok: false, error: 'Debe iniciar sesión' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        error: `Acceso restringido a: ${roles.join(', ')}`
      });
    }
    next();
  };
}
