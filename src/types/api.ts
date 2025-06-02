// API types
// This defines consistent API response structures across the application

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Enhanced API response types for better error handling and consistency
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    field?: string; // For validation errors
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

export type ApiResult<T = any> = ApiSuccess<T> | ApiError;

// Specific response types for common operations
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'subadmin';
    profilePhoto?: string;
  };
  token?: string;
  expiresAt?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse extends ApiError {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationError[];
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    healthy: boolean;
    host?: string;
    name?: string;
  };
  performance: {
    responseTime: string;
  };
  environment: {
    nodeEnv: string;
    nodeVersion: string;
  };
}

// Status check response
export interface StatusResponse {
  status: 'ok' | 'error';
  timestamp: string;
  environment: string;
  features: {
    email: boolean;
    fileUpload: boolean;
    adminSeeding: boolean;
  };
  database: {
    status: string;
    healthy: boolean;
    host?: string;
    name?: string;
  };
  uptime: number;
}

// File upload response
export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

// Bulk operation response
export interface BulkOperationResponse<T = any> {
  success: T[];
  failed: {
    item: T;
    error: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search response
export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters?: Record<string, any>;
  suggestions?: string[];
  facets?: Record<string, any>;
}

// Export/Import response
export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  format: string;
  expiresAt: string;
  recordCount: number;
}

export interface ImportResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: {
    processed: number;
    total: number;
    percentage: number;
  };
  results?: BulkOperationResponse;
}

// Type guards for API responses
export function isApiSuccess<T>(response: ApiResult<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResult): response is ApiError {
  return response.success === false;
}

export function isValidationError(response: ApiResult): response is ValidationErrorResponse {
  return isApiError(response) && response.error.code === 'VALIDATION_ERROR';
}

// Common error codes
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // File operations
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

// HTTP status codes mapping
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
