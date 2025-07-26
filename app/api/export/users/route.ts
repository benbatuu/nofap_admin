import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const status = searchParams.get('status') as any
        const isPremium = searchParams.get('isPremium') === 'true' ? true : searchParams.get('isPremium') === 'false' ? false : undefined

        // Validate format
        const validFormats = ['json', 'csv']
        if (!validFormats.includes(format)) {
            return NextResponse.json(
                { success: false, error: `Invalid format. Must be one of: ${validFormats.join(', ')}` },
                { status: 400 }
            )
        }

        // Get all users with filters (no pagination for export)
        const result = await UserService.getUsers({ 
            page: 1,
            limit: 10000, // Large limit for export
            status,
            isPremium
        })

        const users = result.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            isPremium: user.isPremium,
            streak: user.streak,
            globalEnabled: user.globalEnabled,
            lastActivity: user.lastActivity,
            createdAt: user.createdAt
        }))

        if (format === 'csv') {
            // Convert to CSV format
            const headers = ['ID', 'Name', 'Email', 'Status', 'Premium', 'Streak', 'Enabled', 'Last Activity', 'Created At']
            const csvRows = [
                headers.join(','),
                ...users.map(user => [
                    user.id,
                    `"${user.name}"`,
                    user.email,
                    user.status,
                    user.isPremium,
                    user.streak,
                    user.globalEnabled,
                    user.lastActivity.toISOString(),
                    user.createdAt.toISOString()
                ].join(','))
            ]

            const csvContent = csvRows.join('\n')

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        // JSON format
        return NextResponse.json({
            success: true,
            data: {
                exportDate: new Date().toISOString(),
                totalRecords: users.length,
                filters: { status, isPremium },
                users
            }
        }, {
            headers: {
                'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.json"`
            }
        })
    } catch (error) {
        console.error('Export users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to export users' },
            { status: 500 }
        )
    }
}