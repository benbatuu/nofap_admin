import { NextRequest, NextResponse } from 'next/server'
import { DeviceService } from '@/lib/services'

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
        const userId = searchParams.get('userId') || undefined
        const deviceType = searchParams.get('deviceType') || undefined
        const os = searchParams.get('os') || undefined
        const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
        const isTrusted = searchParams.get('isTrusted') === 'true' ? true : searchParams.get('isTrusted') === 'false' ? false : undefined
        const search = searchParams.get('search') || undefined
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

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

        logRequest('GET', url, { page, limit, userId, deviceType, os, isActive, isTrusted, search, dateFrom, dateTo })

        const result = await DeviceService.getDevices({
            page,
            limit,
            userId,
            deviceType,
            os,
            isActive,
            isTrusted,
            search,
            dateFrom,
            dateTo
        })

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Devices API Error:', error)
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
        
        logRequest('POST', url, { userId: data.userId, deviceType: data.deviceType, os: data.os })

        // Validate input data
        const validationErrors = DeviceService.validateDeviceData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['userId', 'deviceId', 'deviceName', 'deviceType', 'os', 'ipAddress']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const device = await DeviceService.createDevice(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: device,
            message: 'Device created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create device API error:', error)
        
        // Handle unique constraint errors
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { success: false, error: 'Device ID already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create device' },
            { status: 500 }
        )
    }
}