import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const action = searchParams.get('action') || undefined
        const resource = searchParams.get('resource') || undefined
        const userId = searchParams.get('userId') || undefined
        const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
        const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

        // Validate format
        const validFormats = ['json', 'csv']
        if (!validFormats.includes(format)) {
            return NextResponse.json(
                { success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
                { status: 400 }
            )
        }

        // Export audit logs
        const exportData = await AuditService.exportAuditLogs({
            action,
            resource,
            userId,
            dateFrom,
            dateTo
        })

        if (format === 'csv') {
            // Convert to CSV format
            const headers = ['ID', 'Action', 'Resource', 'Resource ID', 'User ID', 'User Name', 'IP Address', 'Timestamp']
            const csvRows = [
                headers.join(','),
                ...exportData.logs.map(log => [
                    log.id,
                    log.action,
                    log.resource,
                    log.resourceId || '',
                    log.userId,
                    `"${log.userName}"`,
                    log.ipAddress,
                    log.timestamp.toISOString()
                ].join(','))
            ]

            const csvContent = csvRows.join('\n')

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="audit_export_${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        // JSON format
        return NextResponse.json({
            success: true,
            data: exportData
        }, {
            headers: {
                'Content-Disposition': `attachment; filename="audit_export_${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error('Export audit API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to export audit logs' },
            { status: 500 }
        )
    }
}