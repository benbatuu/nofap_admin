import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') as 'csv' | 'json' || 'csv'
        const type = searchParams.get('type') as any
        const status = searchParams.get('status') as any
        const search = searchParams.get('search') || undefined

        if (!['csv', 'json'].includes(format)) {
            return NextResponse.json(
                { success: false, error: 'Format must be csv or json' },
                { status: 400 }
            )
        }

        const filters = { type, status, search }
        const exportData = await MessageService.exportMessages(format, filters)

        const contentType = format === 'csv' ? 'text/csv' : 'application/json'
        const filename = `messages_export_${new Date().toISOString().split('T')[0]}.${format}`

        return new NextResponse(exportData, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error) {
        console.error('Message export API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to export messages' },
            { status: 500 }
        )
    }
}