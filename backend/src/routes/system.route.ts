import { Router } from 'express';
import * as SystemController from '../controllers/system.controller';

const router = Router();

router.get('/health', SystemController.getHealth);
router.get('/info', SystemController.getSystemInfo);

export default router;
