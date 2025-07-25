import { NextRequest, NextResponse } from 'next/server'
import { updatePermission, deletePermission, getPermissionById } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const permission = await getPermissionById(params.id)

        if (!permission) {
            return NextResponse.json(
                { success: false, error: 'Permission not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: permission
        })
    } catch (error) {
        console.error('Get permission error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch permission' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { name, description, category } = body

        const permission = await updatePermission(params.id, { name, description, category })

        if (!permission) {
            return NextResponse.json(
                { success: false, error: 'Permission not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: permission
        })
    } catch (error) {
        console.error('Update permission error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update permission' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deletePermission(params.id)

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Permission not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Permission deleted successfully'
        })
    } catch (error) {
        console.error('Delete permission error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete permission' },
            { status: 500 }
        )
    }
}