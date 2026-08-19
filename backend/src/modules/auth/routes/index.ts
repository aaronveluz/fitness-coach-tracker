import { Router } from 'express';
import { validate } from '../../../core/middleware/validate';
import { loginSchema, registerSchema } from '@boilerplate/shared';
import { authController } from '../controller';
import { authLimiter } from '../../../core/middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Token Rotation
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & start session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: admin@example.com }
 *               password: { type: string, example: Admin@1234 }
 *     responses:
 *       200:
 *         description: Login successful. Sets HttpOnly cookie.
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new system user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       210:
 *         description: Registered successfully.
 */
router.post('/register', validate({ body: registerSchema }), authController.register);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token & get new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Refreshed. Sets new HttpOnly cookie.
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Terminate session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully. Clears cookie.
 */
router.post('/logout', authController.logout);

export const authRouter = router;
export default authRouter;
