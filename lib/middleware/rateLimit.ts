import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
    windowMs: number // Time window in milliseconds
    maxRequests: number // Maximum requests per window
    message?: string
    skipSuccessfulRequests?: boolean
    skipFailedRequests?: boolean
}

interface RateLimitStore {
    [key: string]: {
        count: number
        resetTime: number
    }
}

class RateLimiter {
    private store: RateLimitStore = {}
    private config: RateLimitConfig

    constructor(config: RateLimitConfig) {
        this.config = {
            message: 'Too many requests, please try again later.',
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            ...config
        }
    }

    private getKey(request: NextRequest): string {
        // Use IP address as the key, fallback to a default if not available
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
        return ip
    }

    private cleanupExpiredEntries() {
        const now = Date.now()
        Object.keys(this.store).forEach(key => {
            if (this.store[key].resetTime <= now) {
                delete this.store[key]
            }
        })
    }

    async isAllowed(request: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        this.cleanupExpiredEntries()

        const key = this.getKey(request)
        const now = Date.now()
        const windowStart = now
        const windowEnd = now + this.config.windowMs

        if (!this.store[key]) {
            this.store[key] = {
                count: 0,
                resetTime: windowEnd
            }
        }

        const entry = this.store[key]

        // Reset if window has expired
        if (now >= entry.resetTime) {
            entry.count = 0
            entry.resetTime = windowEnd
        }

        const allowed = entry.count < this.config.maxRequests
        const remaining = Math.max(0, this.config.maxRequests - entry.count - 1)

        if (allowed) {
            entry.count++
        }

        return {
            allowed,
            remaining,
            resetTime: entry.resetTime
        }
    }

    createMiddleware() {
        return async (request: NextRequest, handler: () => Promise<NextResponse>) => {
            const { allowed, remaining, resetTime } = await this.isAllowed(request)

            if (!allowed) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: this.config.message,
                        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
                    },
                    { 
                        status: 429,
                        headers: {
                            'X-RateLimit-Limit': this.config.maxRequests.toString(),
                            'X-RateLimit-Remaining': '0',
                            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
                            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
                        }
                    }
                )
            }

            const response = await handler()

            // Add rate limit headers to successful responses
            response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString())
            response.headers.set('X-RateLimit-Remaining', remaining.toString())
            response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())

            return response
        }
    }
}

// Pre-configured rate limiters for different endpoints
export const strictRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.'
})

export const moderateRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500, // 500 requests per 15 minutes
    message: 'Rate limit exceeded, please slow down.'
})

export const lenientRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // 1000 requests per 15 minutes
    message: 'Rate limit exceeded.'
})

// Authentication-specific rate limiter
export const authRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
})

// Export rate limiter (for heavy operations)
export const exportRateLimit = new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 exports per hour
    message: 'Export rate limit exceeded, please try again later.'
})

// Utility function to apply rate limiting to API routes
export function withRateLimit(rateLimiter: RateLimiter) {
    return (handler: (request: NextRequest) => Promise<NextResponse>) => {
        return rateLimiter.createMiddleware()(async (request: NextRequest) => {
            return handler(request)
        })
    }
}

// Rate limit configuration for different API endpoints
export const rateLimitConfigs = {
    '/api/auth': authRateLimit,
    '/api/export': exportRateLimit,
    '/api/users': moderateRateLimit,
    '/api/messages': moderateRateLimit,
    '/api/tasks': moderateRateLimit,
    '/api/notifications': moderateRateLimit,
    '/api/billing': strictRateLimit,
    '/api/security': strictRateLimit,
    '/api/audit': strictRateLimit,
    '/api/settings': strictRateLimit,
    '/api/devices': moderateRateLimit,
    '/api/ads': moderateRateLimit,
    default: lenientRateLimit
}