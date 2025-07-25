import { NextRequest, NextResponse } from 'next/server'
import { updateRole, deleteRole, getRoleById } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const role = await getRoleById(params.id)

        if (!role) {
            return NextResponse.json(
                { success: false, error: 'Role not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: role
        })
    } catch (error) {
        console.error('Get role error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch role' },
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
        const { name, description, permissions } = body

        const role = await updateRole(params.id, { name, description, permissions })

        if (!role) {
            return NextResponse.json(
                { success: false, error: 'Role not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: role
        })
    } catch (error) {
        console.error('Update role error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update role' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deleteRole(params.id)

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Role not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Role deleted successfully'
        })
    } catch (error) {
        console.error('Delete role error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete role' },
            { status: 500 }
        )
    }
}