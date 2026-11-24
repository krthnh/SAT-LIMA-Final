// ============================================================
// src/routes/panel.routes.js
// ============================================================
import { Router } from 'express';
import {
  listarReclamosPanel, actualizarEstadoReclamo, eliminarReclamo
} from '../controllers/panel.controller.js';
import { attachUser } from '../middleware/errorMiddleware.js';

const router = Router();
router.use(attachUser);

router.get('/reclamos', listarReclamosPanel);
router.put('/reclamos/:id', actualizarEstadoReclamo);
router.delete('/reclamos/:id', eliminarReclamo);

export default router;
