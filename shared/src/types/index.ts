// ─────────────────────────────────────────────────────────────────────────────
// shared/src/types/index.ts
//
// Core TypeScript interfaces shared between frontend and backend.
// These define the "shape" of data that flows over the API.
//
// RULE: Never import backend-only or frontend-only code here.
//       This package must be dependency-free except for Zod.
// ─────────────────────────────────────────────────────────────────────────────

import { UserRole } from '../enums';

// ── Standard API Response Shape ───────────────────────────────────────────────
// Every API endpoint returns this structure — no exceptions.
// This makes frontend error handling completely predictable.

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>; // field-level validation errors
  meta?: PaginationMeta;             // included on paginated list responses
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// ── User ─────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: string[];
  companyId?: number;
  branchId?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** What the client sends on login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** What the server returns after a successful login */
export interface LoginResponse {
  accessToken: string;
  user: UserDTO;
}

// ── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLogDTO {
  id: number;
  userId: number;
  action: string;       // e.g. "users.create", "roles.update"
  resource: string;     // table or entity name
  resourceId?: number;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ── Multi-Tenant Hierarchy ────────────────────────────────────────────────────
// These are the top-level business entities.
// All business modules should FK into company/branch where applicable.

export interface CompanyDTO {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface BranchDTO {
  id: number;
  companyId: number;
  name: string;
  code: string;
  isActive: boolean;
}

// ── Report ────────────────────────────────────────────────────────────────────

export interface ReportColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'date' | 'boolean';
  sortable?: boolean;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  columns: ReportColumn[];
  defaultFilters?: Record<string, unknown>;
}
