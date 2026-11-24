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
const allowedOrigins = [
  'https://sat-lima-final.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
  process.env.CORS_ORIGIN.split(',').forEach(url => {
    const cleanUrl = url.trim().replace(/\/$/, '');
    if (cleanUrl && !allowedOrigins.includes(cleanUrl)) {
      allowedOrigins.push(cleanUrl);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (Postman, curl) o desde orígenes autorizados
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Responder rápido a preflight requests

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
