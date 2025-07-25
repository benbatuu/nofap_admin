import { NextRequest, NextResponse } from 'next/server'
import { getUserNotifications, updateUserNotifications, bulkUpdateUserNotifications } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const users = await getUserNotifications()

        return NextResponse.json({
            success: true,
            data: users
        })
    } catch (error) {
        console.error('User notifications API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user notifications' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userIds, updates } = body

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'User IDs are required' },
                { status: 400 }
            )
        }

        const updatedUsers = await bulkUpdateUserNotifications(userIds, updates)

        return NextResponse.json({
            success: true,
            data: updatedUsers
        })
    } catch (error) {
        console.error('Bulk update user notifications error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user notifications' },
            { status: 500 }
        )
    }
}