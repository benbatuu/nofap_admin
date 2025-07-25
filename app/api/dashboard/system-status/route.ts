import { NextResponse } from 'next/server'
import { getSystemStatus } from '@/lib/db'

export async function GET() {
    try {
        const status = await getSystemStatus()

        return NextResponse.json({
            success: true,
            data: status
        })
    } catch (error) {
        console.error('System Status API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}