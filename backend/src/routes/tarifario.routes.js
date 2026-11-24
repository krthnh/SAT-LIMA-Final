// ============================================================
// src/routes/tarifario.routes.js
// ============================================================
import { Router } from 'express';
import { calcular } from '../controllers/tarifario.controller.js';

const router = Router();

router.get('/calcular', calcular);

export default router;
