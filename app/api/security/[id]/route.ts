import { NextRequest, NextResponse } from 'next/server'
import { SecurityService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const securityLog = await SecurityService.getSecurityLogById(params.id)

        if (!securityLog) {
            return NextResponse.json(
                { success: false, error: 'Security log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: securityLog
        })
    } catch (error) {
        console.error('Security log GET API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        
        // Validate input data
        const validationErrors = SecurityService.validateSecurityLogData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedSecurityLog = await SecurityService.updateSecurityLog(params.id, body)

        if (!updatedSecurityLog) {
            return NextResponse.json(
                { success: false, error: 'Security log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedSecurityLog,
            message: 'Security log updated successfully'
        })
    } catch (error) {
        console.error('Security log PUT API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedSecurityLog = await SecurityService.deleteSecurityLog(params.id)

        if (!deletedSecurityLog) {
            return NextResponse.json(
                { success: false, error: 'Security log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedSecurityLog,
            message: 'Security log deleted successfully'
        })
    } catch (error) {
        console.error('Security log DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}