import { Router } from 'express';
import { getPreferences, updateCollapsedCategories } from '../controllers/preferences.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getPreferences);
router.put('/collapsed-categories', authenticate, updateCollapsedCategories);

export default router;
