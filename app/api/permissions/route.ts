import { NextRequest, NextResponse } from 'next/server'
import { PermissionService } from '@/lib/services'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || undefined
        const search = searchParams.get('search') || ''

        // For the permissions page, we want all permissions without pagination
        const result = await PermissionService.getPermissions({ category, search })

        return NextResponse.json({
            success: true,
            data: result.permissions // Return just the permissions array
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
        const data = await request.json()

        if (!data.name || !data.description) {
            return NextResponse.json(
                { success: false, error: 'Name and description are required' },
                { status: 400 }
            )
        }

        const permission = await PermissionService.createPermission({
            ...data,
            category: data.category || 'General'
        })

        return NextResponse.json({
            success: true,
            data: permission,
            message: 'Permission created successfully'
        })
    } catch (error) {
        console.error('Create permission error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create permission' },
            { status: 500 }
        )
    }
}