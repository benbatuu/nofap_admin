import { NextRequest, NextResponse } from 'next/server'
import { getRoles, createRole } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''

        const roles = await getRoles({ search })

        return NextResponse.json({
            success: true,
            data: roles
        })
    } catch (error) {
        console.error('Roles API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch roles' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, permissions } = body

        if (!name || !description) {
            return NextResponse.json(
                { success: false, error: 'Name and description are required' },
                { status: 400 }
            )
        }

        const role = await createRole({ name, description, permissions: permissions || [] })

        return NextResponse.json({
            success: true,
            data: role
        })
    } catch (error) {
        console.error('Create role error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create role' },
            { status: 500 }
        )
    }
}