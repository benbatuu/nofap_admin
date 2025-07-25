import { NextRequest, NextResponse } from 'next/server'
import { getPermissions, createPermission } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''

        const permissions = await getPermissions({ search })

        return NextResponse.json({
            success: true,
            data: permissions
        })
    } catch (error) {
        console.error('Permissions API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch permissions' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, description, category } = body

        if (!name || !description) {
            return NextResponse.json(
                { success: false, error: 'Name and description are required' },
                { status: 400 }
            )
        }

        const permission = await createPermission({ name, description, category: category || 'General' })

        return NextResponse.json({
            success: true,
            data: permission
        })
    } catch (error) {
        console.error('Create permission error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create permission' },
            { status: 500 }
        )
    }
}