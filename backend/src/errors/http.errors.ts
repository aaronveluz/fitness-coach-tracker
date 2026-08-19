import { AppError } from './app.errors';

export function BadRequest(message = 'Bad Request'): never {
  throw new AppError(message, 400);
}

export function Unauthorized(message = 'Unauthorized'): never {
  throw new AppError(message, 401);
}

export function Forbidden(message = 'Forbidden'): never {
  throw new AppError(message, 403);
}

export function NotFound(message = 'Resource Not Found'): never {
  throw new AppError(message, 404);
}
