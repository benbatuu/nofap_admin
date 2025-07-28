import { NextRequest, NextResponse } from 'next/server'
import { BlockedIPService } from '@/lib/services'

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
        const search = searchParams.get('search') || ''

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

        logRequest('GET', url, { page, limit, search })

        const result = await BlockedIPService.getBlockedIPs({ 
            page, 
            limit, 
            search
        })

        // Calculate stats
        const stats = {
            total: result.pagination.total,
            active: 0, // Will be calculated from actual data
            temporary: 0,
            permanent: 0
        }

        // Count by status
        result.blockedIPs.forEach(ip => {
            if (ip.status === 'active') stats.active++
            else if (ip.status === 'temporary') stats.temporary++
            else if (ip.status === 'permanent') stats.permanent++
        })

        const response = {
            ips: result.blockedIPs,
            pagination: result.pagination,
            stats
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: response
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Blocked IPs API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked IPs' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const data = await request.json()
        
        logRequest('POST', url, { ip: data.ip, reason: data.reason })

        // Basic validation
        if (!data.ip || !data.reason) {
            return NextResponse.json(
                { success: false, error: 'IP address and reason are required' },
                { status: 400 }
            )
        }

        // Validate IP format
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        if (!ipRegex.test(data.ip)) {
            return NextResponse.json(
                { success: false, error: 'Invalid IP address format' },
                { status: 400 }
            )
        }

        // Required fields validation
        const requiredFields = ['ip', 'reason', 'status']
        const missingFields = requiredFields.filter(field => !data[field])
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const blockedIP = await BlockedIPService.createBlockedIP({
            ...data,
            blockedBy: 'admin', // In real app, get from auth
            attempts: data.attempts || 1
        })

        logResponse('POST', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: blockedIP,
            message: 'IP blocked successfully'
        })
    } catch (error) {
        logResponse('POST', url, false, Date.now() - startTime)
        console.error('Create blocked IP API error:', error)
        
        // Handle specific database errors
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                { success: false, error: 'IP already blocked' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to block IP' },
            { status: 500 }
        )
    }
}