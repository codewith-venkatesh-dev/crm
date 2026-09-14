import { Router } from 'express';
import {
  getLeadFollowUps,
  createFollowUp,
  updateFollowUp,
  toggleFollowUpCompletion,
  deleteFollowUp,
  createFollowUpSchema,
  updateFollowUpSchema,
} from '../controllers/followUpController';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

// Nested under /api/leads/:leadId/follow-ups or direct /api/follow-ups
router.get('/', getLeadFollowUps);
router.post('/', validate(createFollowUpSchema), createFollowUp);

export const followUpDirectRouter = Router();
followUpDirectRouter.put('/:id', validate(updateFollowUpSchema), updateFollowUp);
followUpDirectRouter.patch('/:id/complete', toggleFollowUpCompletion);
followUpDirectRouter.delete('/:id', deleteFollowUp);

export default router;
