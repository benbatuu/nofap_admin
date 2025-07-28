import { NextRequest, NextResponse } from 'next/server'
import { BlockedIPService } from '@/lib/services'

// Request/Response logging
function logRequest(method: string, url: string, params?: any) {
    console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '')
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`)
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const { id } = params
        
        logRequest('GET', url, { id })

        const blockedIP = await BlockedIPService.getBlockedIPById(id)
        
        if (!blockedIP) {
            return NextResponse.json(
                { success: false, error: 'Blocked IP not found' },
                { status: 404 }
            )
        }

        logResponse('GET', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: blockedIP
        })
    } catch (error) {
        logResponse('GET', url, false, Date.now() - startTime)
        console.error('Get blocked IP API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked IP' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const { id } = params
        const data = await request.json()
        
        logRequest('PUT', url, { id, ip: data.ip })

        const blockedIP = await BlockedIPService.updateBlockedIP(id, data)
        
        if (!blockedIP) {
            return NextResponse.json(
                { success: false, error: 'Blocked IP not found' },
                { status: 404 }
            )
        }

        logResponse('PUT', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            data: blockedIP,
            message: 'Blocked IP updated successfully'
        })
    } catch (error) {
        logResponse('PUT', url, false, Date.now() - startTime)
        console.error('Update blocked IP API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update blocked IP' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const startTime = Date.now()
    const url = request.url
    
    try {
        const { id } = params
        
        logRequest('DELETE', url, { id })

        await BlockedIPService.deleteBlockedIP(id)

        logResponse('DELETE', url, true, Date.now() - startTime)

        return NextResponse.json({
            success: true,
            message: 'Blocked IP deleted successfully'
        })
    } catch (error) {
        logResponse('DELETE', url, false, Date.now() - startTime)
        console.error('Delete blocked IP API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete blocked IP' },
            { status: 500 }
        )
    }
}