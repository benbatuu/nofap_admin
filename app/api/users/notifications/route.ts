import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/services'

// Default notification structure
const defaultNotifications = {
  motivation: {
    push: true,
    email: false,
    sms: false
  },
  dailyReminder: {
    push: true,
    email: false,
    sms: false
  },
  marketing: {
    push: false,
    email: false,
    sms: false
  },
  system: {
    push: true,
    email: true,
    sms: false
  }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''

        const result = await UserService.getUsers({ 
            page, 
            limit, 
            search
        })
        
        // Transform users for notification settings view with proper null/undefined checks
        const users = result.users.map(user => {
            let notifications = defaultNotifications
            
            // Handle notification data transformation from database
            if (user.notifications) {
                try {
                    let parsedNotifications = user.notifications
                    
                    // If it's a string, try to parse it
                    if (typeof user.notifications === 'string') {
                        parsedNotifications = JSON.parse(user.notifications)
                    }
                    
                    // Normalize each notification type to proper structure
                    const normalizedNotifications = {
                        motivation: normalizeNotificationSetting(parsedNotifications.motivation),
                        dailyReminder: normalizeNotificationSetting(parsedNotifications.dailyReminder),
                        marketing: normalizeNotificationSetting(parsedNotifications.marketing),
                        system: normalizeNotificationSetting(parsedNotifications.system)
                    }
                    
                    notifications = normalizedNotifications
                } catch (error) {
                    console.warn(`Failed to parse notifications for user ${user.id}:`, error)
                    // Use default notifications if parsing fails
                    notifications = defaultNotifications
                }
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                globalEnabled: user.globalEnabled,
                notifications,
                lastActivity: user.lastActivity,
                status: user.status,
                isPremium: user.isPremium
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: result.pagination
            }
        })
    } catch (error) {
        console.error('User notifications API error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user notifications' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { userIds, updates } = body

        // Validation
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'User IDs are required and must be an array' },
                { status: 400 }
            )
        }

        if (!updates || typeof updates !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Updates object is required' },
                { status: 400 }
            )
        }

        // Validate notification structure if notifications are being updated
        if (updates.notifications) {
            const validationErrors = validateNotificationStructure(updates.notifications)
            if (validationErrors.length > 0) {
                return NextResponse.json(
                    { success: false, error: 'Invalid notification structure', details: validationErrors },
                    { status: 400 }
                )
            }
        }

        // Use bulk update method for better performance
        if (updates.notifications) {
            await UserService.bulkUpdateNotificationSettings(userIds, updates.notifications)
        }

        // Get updated users to return
        const updatedUsers = await Promise.all(
            userIds.map(userId => UserService.getUserById(userId))
        )

        // Filter out any null results
        const validUsers = updatedUsers.filter(user => user !== null)

        return NextResponse.json({
            success: true,
            data: validUsers,
            message: `Successfully updated ${validUsers.length} users`
        })
    } catch (error) {
        console.error('Bulk update user notifications error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user notifications' },
            { status: 500 }
        )
    }
}

// Helper function to normalize notification setting
function normalizeNotificationSetting(setting: any) {
    // If setting is a boolean, apply to all channels
    if (typeof setting === 'boolean') {
        return {
            push: setting,
            email: setting,
            sms: setting
        }
    }
    
    // If setting is an object, ensure all channels exist
    if (typeof setting === 'object' && setting !== null) {
        return {
            push: setting.push || false,
            email: setting.email || false,
            sms: setting.sms || false
        }
    }
    
    // Default to all false if invalid
    return {
        push: false,
        email: false,
        sms: false
    }
}

// Helper function to validate notification structure
function validateNotificationStructure(notifications: any): string[] {
    const errors: string[] = []
    
    if (typeof notifications !== 'object' || notifications === null) {
        errors.push('Notifications must be an object')
        return errors
    }

    const requiredTypes = ['motivation', 'dailyReminder', 'marketing', 'system']
    const requiredChannels = ['push', 'email', 'sms']

    for (const type of requiredTypes) {
        if (notifications[type]) {
            if (typeof notifications[type] !== 'object') {
                errors.push(`${type} must be an object`)
                continue
            }

            for (const channel of requiredChannels) {
                if (notifications[type][channel] !== undefined && typeof notifications[type][channel] !== 'boolean') {
                    errors.push(`${type}.${channel} must be a boolean`)
                }
            }
        }
    }

    return errors
}