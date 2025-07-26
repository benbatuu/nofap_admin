import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services'

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
        const category = searchParams.get('category') || undefined
        const type = searchParams.get('type') as any
        const isPublic = searchParams.get('isPublic') === 'true' ? true : searchParams.get('isPublic') === 'false' ? false : undefined
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
        const validTypes = ['string', 'number', 'boolean', 'json']

        if (type && !validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, category, type, isPublic, search })

        const result = await SettingsService.getSystemSettings({
            page,
            limit,
            category,
            type,
            isPublic,
            search
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Settings API Error:', error)
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
        
        logRequest('POST', url, { key: data.key, category: data.category, type: data.type })

        // Validate input data
        const validationErrors = SettingsService.validateSystemSettingData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['key', 'value', 'type', 'category', 'description', 'updatedBy']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const setting = await SettingsService.createSystemSetting(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: setting,
            message: 'System setting created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create system setting API error:', error)
        
        // Handle unique constraint errors
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { success: false, error: 'Setting key already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create system setting' },
            { status: 500 }
        )
    }
}