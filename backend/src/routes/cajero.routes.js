// ============================================================
// src/routes/cajero.routes.js
// ============================================================
import { Router } from 'express';
import { listarReclamosCaja } from '../controllers/cajero.controller.js';
import { attachUser } from '../middleware/errorMiddleware.js';

const router = Router();
router.use(attachUser);

router.get('/reclamos', listarReclamosCaja);

export default router;
