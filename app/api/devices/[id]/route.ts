import { NextRequest, NextResponse } from 'next/server'
import { DeviceService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const device = await DeviceService.getDeviceById(params.id)

        if (!device) {
            return NextResponse.json(
                { success: false, error: 'Device not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: device
        })
    } catch (error) {
        console.error('Device GET API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
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
        
        // Validate input data
        const validationErrors = DeviceService.validateDeviceData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        const updatedDevice = await DeviceService.updateDevice(params.id, body)

        if (!updatedDevice) {
            return NextResponse.json(
                { success: false, error: 'Device not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedDevice,
            message: 'Device updated successfully'
        })
    } catch (error) {
        console.error('Device PUT API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const deletedDevice = await DeviceService.deleteDevice(params.id)

        if (!deletedDevice) {
            return NextResponse.json(
                { success: false, error: 'Device not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedDevice,
            message: 'Device deleted successfully'
        })
    } catch (error) {
        console.error('Device DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}