import { NextRequest, NextResponse } from 'next/server'

// Mock data - replace with actual database calls
let blockedUsers = [
    {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        blockedDate: '2024-01-15',
        reason: 'Spam gönderimi',
        blockedBy: 'admin',
        status: 'active' as const,
        blockedUntil: null
    },
    {
        id: '2',
        username: 'jane_smith',
        email: 'jane@example.com',
        blockedDate: '2024-01-20',
        reason: 'Uygunsuz içerik paylaşımı',
        blockedBy: 'moderator',
        status: 'temporary' as const,
        blockedUntil: '2024-08-01'
    },
    {
        id: '3',
        username: 'spam_user',
        email: 'spam@example.com',
        blockedDate: '2024-01-10',
        reason: 'Toplu spam aktivitesi',
        blockedBy: 'system',
        status: 'permanent' as const,
        blockedUntil: null
    }
]

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = blockedUsers.find(u => u.id === params.id)

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
        console.error('Get blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked user' },
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
        const userIndex = blockedUsers.findIndex(u => u.id === params.id)

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        const updatedUser = {
            ...blockedUsers[userIndex],
            ...body,
            blockedUntil: body.status === 'temporary' ? body.blockedUntil : null
        }

        blockedUsers[userIndex] = updatedUser

        return NextResponse.json({
            success: true,
            data: updatedUser
        })
    } catch (error) {
        console.error('Update blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update blocked user' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userIndex = blockedUsers.findIndex(u => u.id === params.id)

        if (userIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        blockedUsers.splice(userIndex, 1)

        return NextResponse.json({
            success: true,
            data: { message: 'User deleted successfully' }
        })
    } catch (error) {
        console.error('Delete blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete blocked user' },
            { status: 500 }
        )
    }
}