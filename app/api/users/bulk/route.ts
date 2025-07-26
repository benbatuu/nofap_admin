import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, userIds, data } = body

        if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Action and userIds array are required' },
                { status: 400 }
            )
        }

        let result

        switch (action) {
            case 'updateStatus':
                if (!data?.status) {
                    return NextResponse.json(
                        { success: false, error: 'Status is required for updateStatus action' },
                        { status: 400 }
                    )
                }
                result = await UserService.bulkUpdateUserStatus(userIds, data.status)
                break

            case 'updateNotifications':
                if (!data?.notifications) {
                    return NextResponse.json(
                        { success: false, error: 'Notifications are required for updateNotifications action' },
                        { status: 400 }
                    )
                }
                result = await UserService.bulkUpdateNotificationSettings(userIds, data.notifications)
                break

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action. Supported actions: updateStatus, updateNotifications' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Bulk ${action} completed successfully for ${userIds.length} users`
        })
    } catch (error) {
        console.error('Bulk users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to perform bulk operation' },
            { status: 500 }
        )
    }
}