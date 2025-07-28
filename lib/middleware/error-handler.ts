import { NextRequest, NextResponse } from 'next/server';
import { APIError, createErrorResponse, ErrorCode } from '@/lib/utils/api-response';

// Request context interface
export interface RequestContext {
  requestId: string;
  startTime: number;
  userId?: string;
  userRole?: string;
}

// Middleware function type
export type MiddlewareFunction = (
  request: NextRequest,
  context: RequestContext
) => Promise<NextResponse | void>;

// Error handler middleware
export function withErrorHandler(
  handler: (request: NextRequest, context: RequestContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    const context: RequestContext = {
      requestId,
      startTime,
    };

    try {
      return await handler(request, context);
    } catch (error) {
      console.error(`[${requestId}] API Error:`, error);
      
      if (error instanceof APIError) {
        return createErrorResponse(error, requestId);
      }
      
      // Handle different error types
      if (error && typeof error === 'object') {
        const err = error as any;
        
        // Prisma errors
        if (err.code) {
          switch (err.code) {
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
            case 'P2003':
              return createErrorResponse(
                new APIError(ErrorCode.BAD_REQUEST, 'Foreign key constraint failed', 400),
                requestId
              );
            default:
              return createErrorResponse(
                new APIError(ErrorCode.INTERNAL_ERROR, 'Database error', 500),
                requestId
              );
          }
        }
        
        // Validation errors
        if (err.name === 'ValidationError') {
          return createErrorResponse(
            new APIError(ErrorCode.VALIDATION_ERROR, err.message, 400, err.details),
            requestId
          );
        }
      }
      
      return createErrorResponse(
        new APIError(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500),
        requestId
      );
    }
  };
}

// Request logging middleware
export function withRequestLogging(): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    const { method, url } = request;
    const { requestId, startTime } = context;
    
    console.log(`[${requestId}] ${method} ${url} - Started`);
    
    // Log request completion in the next tick
    process.nextTick(() => {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${method} ${url} - Completed in ${duration}ms`);
    });
  };
}

// Rate limiting middleware
export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): MiddlewareFunction {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return async (request: NextRequest, context: RequestContext) => {
    const clientId = request.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key);
      }
    }
    
    const clientData = requests.get(clientId);
    
    if (!clientData) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return;
    }
    
    if (now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return;
    }
    
    if (clientData.count >= maxRequests) {
      throw new APIError(
        ErrorCode.RATE_LIMITED,
        'Rate limit exceeded. Please try again later.',
        429
      );
    }
    
    clientData.count++;
  };
}

// Authentication middleware
export function withAuth(requiredRole?: string): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError(ErrorCode.UNAUTHORIZED, 'Missing or invalid authorization header', 401);
    }
    
    const token = authHeader.substring(7);
    
    // TODO: Implement actual JWT verification
    // For now, we'll skip actual token verification
    // In a real implementation, you would:
    // 1. Verify JWT signature
    // 2. Check token expiration
    // 3. Extract user info from token
    // 4. Check user permissions
    
    // Mock user context (replace with actual JWT verification)
    context.userId = 'mock-user-id';
    context.userRole = 'admin';
    
    if (requiredRole && context.userRole !== requiredRole) {
      throw new APIError(
        ErrorCode.FORBIDDEN,
        `Required role: ${requiredRole}`,
        403
      );
    }
  };
}

// Validation middleware
export function withValidation<T>(
  schema: (data: any) => { success: boolean; data?: T; errors?: string[] }
): MiddlewareFunction {
  return async (request: NextRequest, context: RequestContext) => {
    if (request.method === 'GET') return;
    
    try {
      const body = await request.json();
      const validation = schema(body);
      
      if (!validation.success) {
        throw new APIError(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          400,
          validation.errors
        );
      }
      
      // Store validated data in context for use in handler
      (context as any).validatedData = validation.data;
    } catch (error) {
      if (error instanceof APIError) throw error;
      
      throw new APIError(
        ErrorCode.BAD_REQUEST,
        'Invalid JSON in request body',
        400
      );
    }
  };
}

// Compose multiple middlewares
export function composeMiddleware(...middlewares: MiddlewareFunction[]) {
  return async (request: NextRequest, context: RequestContext) => {
    for (const middleware of middlewares) {
      const result = await middleware(request, context);
      if (result instanceof NextResponse) {
        return result;
      }
    }
  };
}

// Helper to create API route with middleware
export function createAPIRoute(
  handler: (request: NextRequest, context: RequestContext) => Promise<NextResponse>,
  ...middlewares: MiddlewareFunction[]
) {
  return withErrorHandler(async (request: NextRequest, context: RequestContext) => {
    // Run middlewares
    const middlewareResult = await composeMiddleware(...middlewares)(request, context);
    if (middlewareResult instanceof NextResponse) {
      return middlewareResult;
    }
    
    // Run main handler
    return await handler(request, context);
  });
}