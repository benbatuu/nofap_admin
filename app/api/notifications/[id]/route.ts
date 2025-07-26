import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const notification = await NotificationService.getNotificationById(params.id)

        if (!notification) {
            return NextResponse.json(
                { success: false, error: 'Notification not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: notification
        })
    } catch (error) {
        console.error('Notification GET API Error:', error)
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
        const data = await request.json()
        const notification = await NotificationService.updateNotification(params.id, data)

        if (!notification) {
            return NextResponse.json(
                { success: false, error: 'Notification not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: notification,
            message: 'Notification updated successfully'
        })
    } catch (error) {
        console.error('Notification PUT API Error:', error)
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
        await NotificationService.deleteNotification(params.id)

        return NextResponse.json({
            success: true,
            message: 'Notification deleted successfully'
        })
    } catch (error) {
        console.error('Notification DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}