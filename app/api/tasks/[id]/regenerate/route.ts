import { NextRequest, NextResponse } from 'next/server'
import { TaskService, UserService } from '@/lib/services'
// Direct import for server-side only
const { AITaskGenerator } = require('@/lib/services/ai-task-generator.service')

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const taskId = params.id

        // Get existing task
        const existingTask = await TaskService.getTaskById(taskId)
        if (!existingTask) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            )
        }

        // Get comprehensive user data
        const user = await UserService.getUserById(existingTask.userId)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Get additional context for better regeneration
        const [recentTasks, completedTasks, failedTasks] = await Promise.all([
            TaskService.getTasksByUser(existingTask.userId, 5),
            TaskService.getTasks({ userId: existingTask.userId, status: 'completed', limit: 5 }),
            TaskService.getTasks({ userId: existingTask.userId, status: 'expired', limit: 5 })
        ])

        // Get slip data if available
        let slipData = null
        if (existingTask.slipId) {
            // slipData = await SlipService.getSlipById(existingTask.slipId)
        }

        // Calculate task completion rate for this specific task type/category
        const similarTasks = [...(completedTasks.tasks || []), ...(failedTasks.tasks || [])]
            .filter(task => task.category === existingTask.category)
        const completionRate = similarTasks.length > 0 ? 
            (completedTasks.tasks?.filter(t => t.category === existingTask.category).length || 0) / similarTasks.length * 100 : 0

        // Enhance user object
        const enhancedUser = {
            ...user,
            completedTasks: completedTasks.tasks?.length || 0,
            failedTasks: failedTasks.tasks?.length || 0,
            preferredCategories: extractPreferredCategories(completedTasks.tasks || []),
            avoidedCategories: extractAvoidedCategories(failedTasks.tasks || [])
        }

        // Generate new AI task based on existing task context
        const generatedTasks = await AITaskGenerator.generateTasks({
            user: enhancedUser,
            slipData,
            taskType: 'regenerate',
            count: 1,
            recentTasks: recentTasks || [],
            completedTasks: completedTasks.tasks || [],
            failedTasks: failedTasks.tasks || [],
            existingTask: {
                category: existingTask.category,
                difficulty: existingTask.difficulty,
                previousTitle: existingTask.title,
                previousDescription: existingTask.description,
                completionRate: Math.round(completionRate)
            }
        })

// Helper functions (same as in main file)
function extractPreferredCategories(completedTasks: any[]): string[] {
    const categoryCounts: { [key: string]: number } = {}
    
    completedTasks.forEach(task => {
        if (task.category) {
            categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1
        }
    })

    return Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)
}

function extractAvoidedCategories(failedTasks: any[]): string[] {
    const categoryCounts: { [key: string]: number } = {}
    
    failedTasks.forEach(task => {
        if (task.category) {
            categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1
        }
    })

    return Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([category]) => category)
}

        if (generatedTasks.length === 0) {
            return NextResponse.json(
                { success: false, error: 'AI görev oluşturulamadı' },
                { status: 500 }
            )
        }

        const newTaskData = generatedTasks[0]

        // Update existing task with new AI-generated content
        const updatedTask = await TaskService.updateTask(taskId, {
            title: newTaskData.title,
            description: newTaskData.description,
            category: newTaskData.category,
            difficulty: newTaskData.difficulty,
            dueDate: newTaskData.dueDate,
            aiConfidence: newTaskData.aiConfidence,
            status: 'active' // Reset status to active
        })

        return NextResponse.json({
            success: true,
            data: updatedTask,
            message: 'Görev AI tarafından yeniden oluşturuldu'
        })
    } catch (error) {
        console.error('Task Regeneration Error:', error)
        return NextResponse.json(
            { success: false, error: 'Görev yeniden oluşturulurken bir hata oluştu' },
            { status: 500 }
        )
    }
}