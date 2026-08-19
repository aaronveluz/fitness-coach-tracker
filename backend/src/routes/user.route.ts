import { Router } from 'express';
import { Authorization } from '../guards/auth.guard';
import { requirePermission } from '../guards/rbac.guard';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.use(Authorization);

router.get('/', requirePermission('users.read'), UserController.getAllUsers);
router.get('/:id', requirePermission('users.read'), UserController.getUserById);
router.post('/', requirePermission('users.create'), UserController.createUser);
router.put('/:id', requirePermission('users.update'), UserController.updateUser);
router.delete('/:id', requirePermission('users.delete'), UserController.deleteUser);

export default router;
