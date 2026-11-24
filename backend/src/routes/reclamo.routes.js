// ============================================================
// src/routes/reclamo.routes.js
// ============================================================
import { Router } from 'express';
import {
  crearReclamo, misReclamos, consultaPublica,
  buscarMisReclamos, obtenerReclamo, editarReclamoPropio
} from '../controllers/reclamo.controller.js';
import { attachUser } from '../middleware/errorMiddleware.js';

const router = Router();

// Todas las rutas usan attachUser (no bloquea si no hay sesión,
// pero cada controlador decide si requiere auth).
router.use(attachUser);

// OJO al orden: las rutas estáticas (/consulta, /mios, /mios/buscar)
// deben declararse ANTES que /:id, si no Express las captura como id.
router.get('/consulta', consultaPublica);
router.get('/mios', misReclamos);
router.get('/mios/buscar', buscarMisReclamos);
router.get('/:id', obtenerReclamo);

// Requieren sesión (lo valida el controlador)
router.post('/', crearReclamo);
router.put('/:id', editarReclamoPropio);

export default router;
