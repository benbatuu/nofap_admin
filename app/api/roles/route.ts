import { NextRequest, NextResponse } from 'next/server'
import { RoleService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        
        // For the roles page, we want all roles without pagination
        const result = await RoleService.getRoles({ search })

        return NextResponse.json({
            success: true,
            data: result.roles // Return just the roles array
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
        const data = await request.json()

        if (!data.name || !data.description) {
            return NextResponse.json(
                { success: false, error: 'Name and description are required' },
                { status: 400 }
            )
        }

        const role = await RoleService.createRole(data)

        return NextResponse.json({
            success: true,
            data: role,
            message: 'Role created successfully'
        })
    } catch (error) {
        console.error('Create role error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create role' },
            { status: 500 }
        )
    }
}