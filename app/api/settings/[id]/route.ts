import { NextRequest, NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const setting = await SettingsService.getSystemSettingById(params.id)

        if (!setting) {
            return NextResponse.json(
                { success: false, error: 'System setting not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: setting
        })
    } catch (error) {
        console.error('System setting GET API Error:', error)
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
        const validationErrors = SettingsService.validateSystemSettingData(body)
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validationErrors },
                { status: 400 }
            )
        }

        // updatedBy is required for updates
        if (!body.updatedBy) {
            return NextResponse.json(
                { success: false, error: 'updatedBy field is required' },
                { status: 400 }
            )
        }

        const updatedSetting = await SettingsService.updateSystemSetting(params.id, body)

        if (!updatedSetting) {
            return NextResponse.json(
                { success: false, error: 'System setting not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedSetting,
            message: 'System setting updated successfully'
        })
    } catch (error) {
        console.error('System setting PUT API Error:', error)
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
        const deletedSetting = await SettingsService.deleteSystemSetting(params.id)

        if (!deletedSetting) {
            return NextResponse.json(
                { success: false, error: 'System setting not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: deletedSetting,
            message: 'System setting deleted successfully'
        })
    } catch (error) {
        console.error('System setting DELETE API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}