import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        message: 'NoFap Admin API',
        version: '1.0.0',
        status: 'active'
    })
}