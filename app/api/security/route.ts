import { NextRequest, NextResponse } from 'next/server'
import { SecurityService } from '@/lib/services'

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
        const eventType = searchParams.get('eventType') as any
        const severity = searchParams.get('severity') as any
        const userId = searchParams.get('userId') || undefined
        const ipAddress = searchParams.get('ipAddress') || undefined
        const resolved = searchParams.get('resolved') === 'true' ? true : searchParams.get('resolved') === 'false' ? false : undefined
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

        // Validate enum values
        const validEventTypes = ['login_attempt', 'failed_login', 'suspicious_activity', 'data_breach_attempt', 'unauthorized_access', 'password_change', 'account_lockout', 'privilege_escalation']
        const validSeverities = ['low', 'medium', 'high', 'critical']

        if (eventType && !validEventTypes.includes(eventType)) {
            return NextResponse.json(
                { success: false, error: `Invalid event type. Must be one of: ${validEventTypes.join(', ')}` },
                { status: 400 }
            )
        }

        if (severity && !validSeverities.includes(severity)) {
            return NextResponse.json(
                { success: false, error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` },
                { status: 400 }
            )
        }

        logRequest('GET', url, { page, limit, eventType, severity, userId, ipAddress, resolved, search, dateFrom, dateTo })

        const result = await SecurityService.getSecurityLogs({
            page,
            limit,
            eventType,
            severity,
            userId,
            ipAddress,
            resolved,
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
        console.error('Security API Error:', error)
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
        
        logRequest('POST', url, { eventType: data.eventType, severity: data.severity, ipAddress: data.ipAddress })

        // Validate input data
        const validationErrors = SecurityService.validateSecurityLogData(data)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['eventType', 'description', 'ipAddress', 'severity']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const securityLog = await SecurityService.createSecurityLog(data)

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: securityLog,
            message: 'Security log created successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create security log API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create security log' },
            { status: 500 }
        )
    }
}