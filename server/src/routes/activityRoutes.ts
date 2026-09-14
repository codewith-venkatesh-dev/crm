import { Router } from 'express';
import {
  getLeadActivities,
  createActivity,
  createActivitySchema,
} from '../controllers/activityController';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', getLeadActivities);
router.post('/', validate(createActivitySchema), createActivity);

export default router;
