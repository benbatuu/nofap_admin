import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const auditLog = await AuditService.getAuditLogById(params.id)

        if (!auditLog) {
            return NextResponse.json(
                { success: false, error: 'Audit log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: auditLog
        })
    } catch (error) {
        console.error('Audit log GET API Error:', error)
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
        const validationErrors = AuditService.validateAuditLogData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedAuditLog = await AuditService.updateAuditLog(params.id, body)

        if (!updatedAuditLog) {
            return NextResponse.json(
                { success: false, error: 'Audit log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedAuditLog,
            message: 'Audit log updated successfully'
        })
    } catch (error) {
        console.error('Audit log PUT API Error:', error)
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
        const deletedAuditLog = await AuditService.deleteAuditLog(params.id)

        if (!deletedAuditLog) {
            return NextResponse.json(
                { success: false, error: 'Audit log not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedAuditLog,
            message: 'Audit log deleted successfully'
        })
    } catch (error) {
        console.error('Audit log DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}