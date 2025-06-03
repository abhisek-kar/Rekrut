import { NextResponse } from 'next/server';
import { 
  ApiSuccess, 
  ApiError, 
  ApiErrorCode, 
  HTTP_STATUS,
  ValidationError,
  ValidationErrorResponse,
  PaginatedResponse
} from '@/types/api';
import { log } from '@/lib/logger';
import { ZodError } from 'zod';

/**
 * API response utility functions for consistent API responses
 */

/**
 * Create a successful API response
 */
export function createApiSuccess<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): NextResponse {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create an error API response
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  field?: string
): NextResponse {
  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
      details,
      field,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  // Log the error for monitoring
  log.error(`API Error: ${code}`, undefined, { 
    code, 
    message, 
    statusCode, 
    details 
  });

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a validation error response from Zod errors
 */
export function createValidationError(
  zodError: ZodError,
  statusCode: number = HTTP_STATUS.UNPROCESSABLE_ENTITY
): NextResponse {
  const validationErrors: ValidationError[] = zodError.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code,
  }));

  const response: ValidationErrorResponse = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: validationErrors,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  log.warn('Validation error', { validationErrors });

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): NextResponse {
  const pages = Math.ceil(total / limit);
  
  const response: ApiSuccess<PaginatedResponse<T>> = {
    success: true,
    data: {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    },
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: HTTP_STATUS.OK });
}

/**
 * Handle common API errors with appropriate responses
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  if (error instanceof ZodError) {
    return createValidationError(error);
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('duplicate key')) {
      return createApiError(
        'ALREADY_EXISTS',
        'Resource already exists',
        undefined,
        HTTP_STATUS.CONFLICT
      );
    }

    if (error.message.includes('not found')) {
      return createApiError(
        'NOT_FOUND',
        'Resource not found',
        undefined,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (error.message.includes('unauthorized')) {
      return createApiError(
        'UNAUTHORIZED',
        'Authentication required',
        undefined,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (error.message.includes('forbidden')) {
      return createApiError(
        'FORBIDDEN',
        'Insufficient permissions',
        undefined,
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Database errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return createApiError(
        'DATABASE_ERROR',
        'Database operation failed',
        process.env.NODE_ENV === 'development' ? error.message : undefined,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Generic error
    log.error(`API Error in ${context || 'unknown context'}`, error);
    return createApiError(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? error.message : undefined,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // Unknown error type
  log.error(`Unknown API Error in ${context || 'unknown context'}`, new Error(String(error)));
  return createApiError(
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    undefined,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Middleware wrapper for API routes with consistent error handling
 */
export function withApiHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, handler.name);
    }
  };
}

/**
 * Validate request method
 */
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return createApiError(
      'INVALID_INPUT',
      `Method ${request.method} not allowed`,
      { allowedMethods },
      HTTP_STATUS.BAD_REQUEST
    );
  }
  return null;
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T>(
  request: Request,
  validator?: (data: unknown) => T
): Promise<T> {
  try {
    const body = await request.json();
    
    if (validator) {
      return validator(body);
    }
    
    return body as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in request body');
    }
    throw error;
  }
}

/**
 * Extract pagination parameters from URL
 */
export function extractPaginationParams(url: URL): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Extract filter parameters from URL
 */
export function extractFilterParams(url: URL): Record<string, string> {
  const filters: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'sort', 'order'].includes(key)) {
      filters[key] = value;
    }
  });
  
  return filters;
}

/**
 * Extract sort parameters from URL
 */
export function extractSortParams(url: URL): {
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
} {
  const sortBy = url.searchParams.get('sort') || undefined;
  const sortOrder = url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  
  return { sortBy, sortOrder };
}

/**
 * Check if user has required role
 */
export function checkRole(
  userRole: string,
  requiredRoles: string[]
): NextResponse | null {
  if (!requiredRoles.includes(userRole)) {
    return createApiError(
      'FORBIDDEN',
      'Insufficient permissions',
      { requiredRoles, userRole },
      HTTP_STATUS.FORBIDDEN
    );
  }
  return null;
}

/**
 * Rate limiting check
 */
export function checkRateLimit(
  _identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _limit: number = 100,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _windowMs: number = 15 * 60 * 1000
): NextResponse | null {
  // This would typically integrate with Redis or another rate limiting service
  // For now, it's a placeholder that always returns null (no rate limiting)
  return null;
}
