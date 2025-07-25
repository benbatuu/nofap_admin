import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        const result = await getUsers({ page, limit, search })

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Users API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}