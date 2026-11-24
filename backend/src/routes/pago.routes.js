// ============================================================
// src/routes/pago.routes.js
// ============================================================
import { Router } from 'express';
import {
  pagarConTarjeta, pagarConBilletera, cobroCaja, listarPagos
} from '../controllers/pago.controller.js';
import { attachUser } from '../middleware/errorMiddleware.js';

const router = Router();
router.use(attachUser);

router.post('/tarjeta', pagarConTarjeta);
router.post('/billetera', pagarConBilletera);
router.post('/caja', cobroCaja);
router.get('/', listarPagos);

export default router;
