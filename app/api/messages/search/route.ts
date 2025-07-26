import { NextRequest, NextResponse } from 'next/server'
import { MessageService } from '@/lib/services'

export async function POST(request: NextRequest) {
    try {
        const filters = await request.json()

        // Validate date strings if provided
        if (filters.dateFrom) {
            filters.dateFrom = new Date(filters.dateFrom)
            if (isNaN(filters.dateFrom.getTime())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid dateFrom format' },
                    { status: 400 }
                )
            }
        }

        if (filters.dateTo) {
            filters.dateTo = new Date(filters.dateTo)
            if (isNaN(filters.dateTo.getTime())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid dateTo format' },
                    { status: 400 }
                )
            }
        }

        const results = await MessageService.advancedSearch(filters)

        return NextResponse.json({
            success: true,
            data: results
        })
    } catch (error) {
        console.error('Message search API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to search messages' },
            { status: 500 }
        )
    }
}