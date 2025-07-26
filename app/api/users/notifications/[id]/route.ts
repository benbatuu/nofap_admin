import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await UserService.getUserById(params.id)

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: user
        })
    } catch (error) {
        console.error('Get user notification error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user notification' },
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
        const { globalEnabled, notifications } = body

        const user = await UserService.updateUser(params.id, { globalEnabled, notifications })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: user
        })
    } catch (error) {
        console.error('Update user notification error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user notification' },
            { status: 500 }
        )
    }
}