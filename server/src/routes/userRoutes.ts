import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  createUserSchema,
  updateUserSchema,
} from '../controllers/userController';
import { validate } from '../middleware/validate';
import { authenticateJWT, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// All user routes require valid JWT token
router.use(authenticateJWT);

router.get('/', getUsers);
router.post('/', requireSuperAdmin, validate(createUserSchema), createUser);
router.put('/:id', requireSuperAdmin, validate(updateUserSchema), updateUser);
router.delete('/:id', requireSuperAdmin, deleteUser);

export default router;
