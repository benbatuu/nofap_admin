import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

// Request/Response logging
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
        const status = searchParams.get('status') as any
        const userId = searchParams.get('userId') || undefined
        const category = searchParams.get('category') || undefined
        const difficulty = searchParams.get('difficulty') || undefined
        const search = searchParams.get('search') || undefined

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

        // Validate enum values
        const validStatuses = ['active', 'completed', 'expired']
        const validDifficulties = ['easy', 'medium', 'hard']

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            )
        }

        if (difficulty && !validDifficulties.includes(difficulty)) {
            return NextResponse.json(
                { success: false, error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, status, userId, category, difficulty, search })

        const result = await TaskService.getTasks({
            page,
            limit,
            status,
            userId,
            category,
            difficulty,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Tasks API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const data = await request.json()
        
        logRequest('POST', url, { title: data.title, userId: data.userId, category: data.category })

        // Validate input data
        const validationErrors = TaskService.validateTaskData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['title', 'description', 'userId', 'userName', 'dueDate', 'category', 'difficulty']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate date format
        const dueDate = new Date(data.dueDate)
        if (isNaN(dueDate.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid due date format' },
                { status: 400 }
            )
        }

        const task = await TaskService.createTask({
            ...data,
            dueDate
        })

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: task,
            message: 'Task created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Tasks POST API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}