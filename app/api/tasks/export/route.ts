import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') as 'csv' | 'json' || 'csv'
        const status = searchParams.get('status') as any
        const category = searchParams.get('category') || undefined
        const difficulty = searchParams.get('difficulty') || undefined
        const userId = searchParams.get('userId') || undefined
        const search = searchParams.get('search') || undefined

        if (!['csv', 'json'].includes(format)) {
            return NextResponse.json(
                { success: false, error: 'Format must be csv or json' },
                { status: 400 }
            )
        }

        const filters = { status, category, difficulty, userId, search }
        const exportData = await TaskService.exportTasks(format, filters)

        const contentType = format === 'csv' ? 'text/csv' : 'application/json'
        const filename = `tasks_export_${new Date().toISOString().split('T')[0]}.${format}`

        return new NextResponse(exportData, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })
    } catch (error) {
        console.error('Task export API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to export tasks' },
            { status: 500 }
        )
    }
}