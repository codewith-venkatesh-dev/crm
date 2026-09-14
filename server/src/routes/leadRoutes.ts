import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
} from '../controllers/leadController';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.patch('/:id/status', validate(updateStatusSchema), updateLeadStatus);
router.delete('/:id', deleteLead);

export default router;
