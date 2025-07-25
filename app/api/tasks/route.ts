import { NextRequest, NextResponse } from 'next/server'
import { getTasks } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status') || undefined
        const userId = searchParams.get('userId') || undefined

        const result = await getTasks(page, limit, status, userId)

        return NextResponse.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Tasks API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Yeni görev oluşturma logic'i burada olacak
        // Şimdilik mock response döndürüyoruz

        return NextResponse.json({
            success: true,
            data: { id: 'new-task-id', ...body },
            message: 'Task created successfully'
        })
    } catch (error) {
        console.error('Tasks POST API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}