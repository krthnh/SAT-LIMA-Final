// ============================================================
// src/server.js — Punto de entrada del backend SAT Lima
// ============================================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import reclamoRoutes from './routes/reclamo.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import panelRoutes from './routes/panel.routes.js';
import cajeroRoutes from './routes/cajero.routes.js';
import tarifarioRoutes from './routes/tarifario.routes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// --- Middlewares globales ---
// CORS flexible para producción (Vercel) y desarrollo local.
const corsOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : true;
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// --- Healthcheck (para Render y Postman) ---
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    servicio: 'SAT Lima Backend',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development'
  });
});

// --- Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/reclamos', reclamoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/panel', panelRoutes);
app.use('/api/cajero', cajeroRoutes);
app.use('/api/tarifario', tarifarioRoutes);

// --- 404 y manejo de errores ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ SAT Lima Backend escuchando en el puerto ${PORT}`);
});

export default app;
