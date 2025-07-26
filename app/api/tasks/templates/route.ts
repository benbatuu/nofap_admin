import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services'

export async function GET() {
    try {
        const templates = await TaskService.getTaskTemplates()

        return NextResponse.json({
            success: true,
            data: templates
        })
    } catch (error) {
        console.error('Get task templates API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to get templates' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        if (!data.title || !data.description || !data.category || !data.difficulty) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, description, category, difficulty' },
                { status: 400 }
            )
        }

        const template = await TaskService.createTaskTemplate(data)

        return NextResponse.json({
            success: true,
            data: template,
            message: 'Template created successfully'
        })
    } catch (error) {
        console.error('Create task template API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create template' },
            { status: 500 }
        )
    }
}