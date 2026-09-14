import { Router } from 'express';
import { login, getMe, loginSchema } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateJWT, getMe);

export default router;
