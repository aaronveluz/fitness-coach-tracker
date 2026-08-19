import { Router } from 'express';
import { validate } from '../guards/validate.guard';
import { authLimiter } from '../guards/rateLimiter.guard';
import { loginSchema, registerSchema } from '@boilerplate/shared';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Token Rotation
 */

router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);
router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
