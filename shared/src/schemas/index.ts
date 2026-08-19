// ─────────────────────────────────────────────────────────────────────────────
// shared/src/schemas/index.ts
//
// Zod validation schemas — used by BOTH frontend (form validation)
// and backend (API request validation). This is the "single source of truth"
// for what valid data looks like.
//
// BEGINNER TIP:
//   Zod schemas do two things at once:
//   1. Validate data at runtime (throws if invalid)
//   2. Infer TypeScript types (no need to write interfaces separately)
//   Example: `type LoginForm = z.infer<typeof loginSchema>`
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Auth Schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ── User Schemas ──────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roleId: z.number().positive(),
  companyId: z.number().positive().optional(),
  branchId: z.number().positive().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// ── Pagination Schema ─────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().positive().default(1),
  pageSize: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z.coerce.boolean().optional(),
});

// ── Report Filter Schema ──────────────────────────────────────────────────────

export const reportFilterSchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).optional(),
  dateTo: z.string().datetime({ offset: true }).optional(),
  companyId: z.coerce.number().positive().optional(),
  branchId: z.coerce.number().positive().optional(),
  exportFormat: z.enum(['json', 'csv', 'excel', 'pdf']).optional(),
});

// ── Inferred Types (use these on the frontend for form types) ─────────────────
// Example in a React component:
//   import { type LoginFormData } from '@boilerplate/shared';
//   const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

export type LoginFormData        = z.infer<typeof loginSchema>;
export type RegisterFormData     = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateUserFormData   = z.infer<typeof createUserSchema>;
export type UpdateUserFormData   = z.infer<typeof updateUserSchema>;
// Named PaginationQueryInput to avoid conflict with the PaginationQuery interface in types/index.ts
export type PaginationQueryInput = z.infer<typeof paginationSchema>;
export type ReportFilter         = z.infer<typeof reportFilterSchema>;
