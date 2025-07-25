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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        let filteredUsers = blockedUsers

        // Apply search filter
        if (search) {
            filteredUsers = blockedUsers.filter(user =>
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.reason.toLowerCase().includes(search.toLowerCase())
            )
        }

        // Apply pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

        const result = {
            users: paginatedUsers,
            pagination: {
                total: filteredUsers.length,
                page,
                limit,
                totalPages: Math.ceil(filteredUsers.length / limit)
            },
            stats: {
                total: blockedUsers.length,
                active: blockedUsers.filter(u => u.status === 'active').length,
                temporary: blockedUsers.filter(u => u.status === 'temporary').length,
                permanent: blockedUsers.filter(u => u.status === 'permanent').length
            }
        }

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Blocked users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch blocked users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, email, reason, status, blockedUntil } = body

        if (!username || !email || !reason || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            reason,
            status,
            blockedUntil: status === 'temporary' ? blockedUntil : null,
            blockedDate: new Date().toISOString().split('T')[0],
            blockedBy: 'admin' // In real app, get from auth context
        }

        blockedUsers.push(newUser)

        return NextResponse.json({
            success: true,
            data: newUser
        })
    } catch (error) {
        console.error('Create blocked user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create blocked user' },
            { status: 500 }
        )
    }
}