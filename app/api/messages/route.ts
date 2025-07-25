import { NextRequest, NextResponse } from 'next/server'
import { getMessages } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const type = searchParams.get('type') || undefined
        const status = searchParams.get('status') || undefined

        const result = await getMessages(page, limit, type, status)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Messages API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}