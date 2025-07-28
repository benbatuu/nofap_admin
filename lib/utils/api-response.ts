import { NextResponse } from 'next/server';

// Standard API response interfaces
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
  meta?: ResponseMeta;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  version?: string;
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

// Error codes enum
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Custom API Error class
export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  pagination?: PaginationInfo,
  meta?: Partial<ResponseMeta>
): NextResponse<APIResponse<T>> {
  const response: APIResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response);
}

// Error response helper
export function createErrorResponse(
  error: APIError | Error,
  requestId?: string
): NextResponse<ErrorResponse> {
  const isAPIError = error instanceof APIError;
  
  const response: ErrorResponse = {
    success: false,
    error: {
      code: isAPIError ? error.code : ErrorCode.INTERNAL_ERROR,
      message: error.message,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
      ...(isAPIError && error.details && { details: error.details }),
    },
  };

  const statusCode = isAPIError ? error.statusCode : 500;
  return NextResponse.json(response, { status: statusCode });
}

// Validation error helper
export function createValidationError(
  message: string,
  details?: any
): APIError {
  return new APIError(ErrorCode.VALIDATION_ERROR, message, 400, details);
}

// Not found error helper
export function createNotFoundError(resource: string): APIError {
  return new APIError(
    ErrorCode.NOT_FOUND,
    `${resource} not found`,
    404
  );
}

// Unauthorized error helper
export function createUnauthorizedError(message = 'Unauthorized'): APIError {
  return new APIError(ErrorCode.UNAUTHORIZED, message, 401);
}

// Forbidden error helper
export function createForbiddenError(message = 'Forbidden'): APIError {
  return new APIError(ErrorCode.FORBIDDEN, message, 403);
}

// Conflict error helper
export function createConflictError(message: string): APIError {
  return new APIError(ErrorCode.CONFLICT, message, 409);
}

// Rate limit error helper
export function createRateLimitError(message = 'Rate limit exceeded'): APIError {
  return new APIError(ErrorCode.RATE_LIMITED, message, 429);
}

// Pagination helper
export function createPaginationInfo(
  total: number,
  page: number,
  limit: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Query parameter parsing helpers
export function parseQueryParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    search,
    sortBy,
    sortOrder,
  };
}

// Filter parsing helper
export function parseFilters(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {};
  
  for (const [key, value] of searchParams.entries()) {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key)) {
      // Handle array values (e.g., status=active,inactive)
      if (value.includes(',')) {
        filters[key] = value.split(',');
      } else {
        filters[key] = value;
      }
    }
  }
  
  return filters;
}

// Response wrapper for consistent error handling
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  requestId?: string
): Promise<NextResponse<APIResponse<T> | ErrorResponse>> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof APIError) {
      return createErrorResponse(error, requestId);
    }
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2002':
          return createErrorResponse(
            new APIError(ErrorCode.CONFLICT, 'Resource already exists', 409),
            requestId
          );
        case 'P2025':
          return createErrorResponse(
            new APIError(ErrorCode.NOT_FOUND, 'Resource not found', 404),
            requestId
          );
        default:
          return createErrorResponse(
            new APIError(ErrorCode.INTERNAL_ERROR, 'Database error', 500),
            requestId
          );
      }
    }
    
    return createErrorResponse(
      new APIError(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500),
      requestId
    );
  }
}