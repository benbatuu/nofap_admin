import { NextRequest, NextResponse } from 'next/server'
import { TaskService, UserService } from '@/lib/services'
// Direct import for server-side only
const { AITaskGenerator } = require('@/lib/services/ai-task-generator.service')

// Helper functions for user context analysis
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

function calculateAverageTaskDuration(completedTasks: any[]): number {
    if (completedTasks.length === 0) return 30 // Default 30 minutes

    // This would need actual duration tracking in your task model
    // For now, return a default based on difficulty
    const durations = completedTasks.map(task => {
        switch (task.difficulty) {
            case 'easy': return 15
            case 'medium': return 30
            case 'hard': return 60
            default: return 30
        }
    })

    return Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
}

export async function POST(request: NextRequest) {
    try {
        const { userId, slipId, taskType = 'single' } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            )
        }

        // Get comprehensive user data for personalized task generation
        const user = await UserService.getUserById(userId)
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        // Get additional user context
        const [recentTasks, completedTasks, failedTasks, recentSlips] = await Promise.all([
            TaskService.getTasksByUser(userId, 10),
            TaskService.getTasks({ userId, status: 'completed', limit: 10 }),
            TaskService.getTasks({ userId, status: 'expired', limit: 10 }),
            // SlipService.getRecentSlipsByUser(userId, 5) // Uncomment when slip service is available
            Promise.resolve([])
        ])

        // Get slip data if provided
        let slipData = null
        if (slipId) {
            // slipData = await SlipService.getSlipById(slipId)
        }

        // Calculate user performance metrics
        const totalTasks = (completedTasks.tasks?.length || 0) + (failedTasks.tasks?.length || 0)
        const completionRate = totalTasks > 0 ? (completedTasks.tasks?.length || 0) / totalTasks : 0

        // Enhance user object with additional context
        const enhancedUser = {
            ...user,
            completedTasks: completedTasks.tasks?.length || 0,
            failedTasks: failedTasks.tasks?.length || 0,
            completionRate: Math.round(completionRate * 100),
            preferredCategories: extractPreferredCategories(completedTasks.tasks || []),
            avoidedCategories: extractAvoidedCategories(failedTasks.tasks || []),
            averageTaskDuration: calculateAverageTaskDuration(completedTasks.tasks || [])
        }

        // Generate AI task(s)
        const generatedTasks = await AITaskGenerator.generateTasks({
            user: enhancedUser,
            slipData,
            recentSlips,
            taskType,
            count: taskType === 'bulk' ? 5 : 1,
            recentTasks: recentTasks || [],
            completedTasks: completedTasks.tasks || [],
            failedTasks: failedTasks.tasks || []
        })

        // Create tasks in database
        const createdTasks = []
        for (const taskData of generatedTasks) {
            const task = await TaskService.createTask({
                title: taskData.title,
                description: taskData.description,
                category: taskData.category,
                difficulty: taskData.difficulty,
                userId: user.id,
                userName: user.name || user.email,
                dueDate: taskData.dueDate,
                aiConfidence: taskData.aiConfidence,
                slipId: slipId || undefined
            })
            createdTasks.push(task)
        }

        return NextResponse.json({
            success: true,
            data: {
                tasks: createdTasks,
                count: createdTasks.length
            },
            message: `${createdTasks.length} AI görev(i) başarıyla oluşturuldu`
        })
    } catch (error) {
        console.error('AI Task Generation Error:', error)
        return NextResponse.json(
            { success: false, error: 'AI görev oluşturma sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}

// Bulk AI task generation for all users
export async function PUT(request: NextRequest) {
    try {
        const { userIds, excludeUserIds = [] } = await request.json()

        let targetUsers = []

        if (userIds && Array.isArray(userIds)) {
            // Generate for specific users
            targetUsers = await Promise.all(
                userIds.map(id => UserService.getUserById(id))
            )
            targetUsers = targetUsers.filter(Boolean)
        } else {
            // Generate for all active users (excluding specified ones)
            const allUsers = await UserService.getUsers({
                limit: 1000,
                status: 'active'
            })
            targetUsers = allUsers.users.filter(user => 
                !excludeUserIds.includes(user.id)
            )
        }

        const results = []
        const errors = []

        for (const user of targetUsers) {
            try {
                // Get comprehensive user context
                const [recentTasks, completedTasks, failedTasks, recentSlips] = await Promise.all([
                    TaskService.getTasksByUser(user.id, 5),
                    TaskService.getTasks({ userId: user.id, status: 'completed', limit: 5 }),
                    TaskService.getTasks({ userId: user.id, status: 'expired', limit: 5 }),
                    Promise.resolve([]) // await SlipService.getRecentSlipsByUser(user.id, 3)
                ])

                // Enhance user object
                const totalTasks = (completedTasks.tasks?.length || 0) + (failedTasks.tasks?.length || 0)
                const completionRate = totalTasks > 0 ? (completedTasks.tasks?.length || 0) / totalTasks : 0

                const enhancedUser = {
                    ...user,
                    completedTasks: completedTasks.tasks?.length || 0,
                    failedTasks: failedTasks.tasks?.length || 0,
                    completionRate: Math.round(completionRate * 100),
                    preferredCategories: extractPreferredCategories(completedTasks.tasks || []),
                    avoidedCategories: extractAvoidedCategories(failedTasks.tasks || []),
                    averageTaskDuration: calculateAverageTaskDuration(completedTasks.tasks || [])
                }
                
                const generatedTasks = await AITaskGenerator.generateTasks({
                    user: enhancedUser,
                    slipData: recentSlips[0] || null,
                    recentSlips,
                    taskType: 'personalized',
                    count: 3,
                    recentTasks: recentTasks || [],
                    completedTasks: completedTasks.tasks || [],
                    failedTasks: failedTasks.tasks || []
                })

                const createdTasks = []
                for (const taskData of generatedTasks) {
                    const task = await TaskService.createTask({
                        title: taskData.title,
                        description: taskData.description,
                        category: taskData.category,
                        difficulty: taskData.difficulty,
                        userId: user.id,
                        userName: user.name || user.email,
                        dueDate: taskData.dueDate,
                        aiConfidence: taskData.aiConfidence
                    })
                    createdTasks.push(task)
                }

                results.push({
                    userId: user.id,
                    userName: user.name || user.email,
                    tasksCreated: createdTasks.length,
                    tasks: createdTasks
                })
            } catch (error) {
                console.error(`Error generating tasks for user ${user.id}:`, error)
                errors.push({
                    userId: user.id,
                    userName: user.name || user.email,
                    error: error.message
                })
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                results,
                errors,
                totalUsers: targetUsers.length,
                successfulUsers: results.length,
                failedUsers: errors.length,
                totalTasksCreated: results.reduce((sum, r) => sum + r.tasksCreated, 0)
            },
            message: `${results.length}/${targetUsers.length} kullanıcı için görevler oluşturuldu`
        })
    } catch (error) {
        console.error('Bulk AI Task Generation Error:', error)
        return NextResponse.json(
            { success: false, error: 'Toplu AI görev oluşturma sırasında bir hata oluştu' },
            { status: 500 }
        )
    }
}