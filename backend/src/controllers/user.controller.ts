import type { Request, Response } from 'express';
import { asyncHandler } from '../errors/app.errors';
import { success } from '../views/rest.view';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAll(req.query as any, ['first_name', 'last_name', 'email']);
  res.json(success(result.rows, 'Users retrieved successfully', result.meta));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(Number(req.params.id));
  res.json(success(user, 'User retrieved successfully'));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const newUser = await userService.create(req.body);
  res.status(201).json(success(newUser, 'User created successfully'));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const updatedUser = await userService.update(Number(req.params.id), req.body);
  res.json(success(updatedUser, 'User updated successfully'));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(Number(req.params.id));
  res.json(success(null, 'User deleted successfully'));
});
