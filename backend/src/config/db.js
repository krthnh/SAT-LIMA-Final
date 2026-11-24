// ============================================================
// src/config/db.js
// Conexión a PostgreSQL (Neon) usando el driver serverless.
// El host pooler (-pooler) es obligatorio para conexiones desde
// serverless / Render, evita el error "this function can now be
// called only as a tagged-template function" y permite conexiones
// concurrentes seguras.
// ============================================================
import { neon } from '@neondatabase/serverless';

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL.trim();
  }
  // Fallback con la URL pooler provista (mejor que la del proyecto
  // original, que usaba el endpoint directo sin pooler).
  return 'postgresql://neondb_owner:npg_RrXCLte0VA4Q@ep-red-tooth-b576izzc-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
}

export const DATABASE_URL = buildDatabaseUrl();

// sql`...` — usar SIEMPRE como tagged template (igual que en el frontend original).
export const sql = neon(DATABASE_URL);

// Helper para lladas con identificador dinámico de tabla
// (Neon no soporta sql("SELECT $1", [val]); requiere tagged template).
export async function countRows(tabla) {
  // tabla viene de una lista blanca interna, no de input externo.
  const seguras = ['banco_tarjetas', 'billeteras', 'pagos', 'reclamos_tributarios', 'usuarios'];
  if (!seguras.includes(tabla)) throw new Error('Tabla no permitida');
  const res = await sql`SELECT COUNT(*)::int AS n FROM ${sql(tabla)}`;
  return res[0].n;
}
