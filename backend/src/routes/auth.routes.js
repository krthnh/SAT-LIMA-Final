// ============================================================
// src/routes/auth.routes.js
// ============================================================
import { Router } from 'express';
import { registrarUsuario, iniciarSesion, perfil } from '../controllers/auth.controller.js';
import { attachUser, requireAuth } from '../middleware/errorMiddleware.js';

const router = Router();

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/perfil', attachUser, perfil);

export default router;
