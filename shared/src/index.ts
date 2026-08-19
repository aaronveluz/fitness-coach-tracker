// ─────────────────────────────────────────────────────────────────────────────
// shared/src/index.ts — Public API of the shared package
//
// Import from this file in both frontend and backend:
//   import { UserRole, loginSchema, type ApiResponse } from '@boilerplate/shared';
// ─────────────────────────────────────────────────────────────────────────────

// Enums
export * from './enums';

// TypeScript types / interfaces
export * from './types';

// Zod schemas + inferred types
export * from './schemas';
