import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function GET() {
    try {
        const categories = await MessageService.getMessageCategories()

        return NextResponse.json({
            success: true,
            data: categories
        })
    } catch (error) {
        console.error('Get message categories API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get message categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { category, limit } = await request.json()

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category is required' },
                { status: 400 }
            )
        }

        const messages = await MessageService.getMessagesByCategory(category, limit)

        return NextResponse.json({
            success: true,
            data: messages
        })
    } catch (error) {
        console.error('Get messages by category API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get messages by category' },
            { status: 500 }
        )
    }
}