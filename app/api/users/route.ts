import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

// Request/Response logging middleware
function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') as any
        const isPremium = searchParams.get('isPremium') === 'true' ? true : searchParams.get('isPremium') === 'false' ? false : undefined

        // Validation
        if (page < 1) {
            return NextResponse.json(
                { success: false, error: 'Page must be greater than 0' },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                { success: false, error: 'Limit must be between 1 and 100' },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, search, status, isPremium })

        const result = await UserService.getUsers({ 
            page, 
            limit, 
            search,
            status,
            isPremium
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const data = await request.json()
        
        logRequest('POST', url, { email: data.email, name: data.name })

        // Validate input data
        const validationErrors = await UserService.validateUserData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const user = await UserService.createUser(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create user API error:', error)
        
        // Handle specific database errors
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        )
    }
}