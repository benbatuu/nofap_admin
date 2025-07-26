// Example usage of database services
// This file shows how to use the various services in your application

import {
  UserService,
  MessageService,
  TaskService,
  NotificationService,
  BillingService,
  ProductService,
  RoleService,
  PermissionService,
  ActivityService,
  BlockedUserService,
  DashboardService
} from '@/lib/services'

// Example: User Management
async function userExamples() {
  // Get paginated users with filters
  const users = await UserService.getUsers({
    page: 1,
    limit: 10,
    search: 'john',
    status: 'active',
    isPremium: true
  })

  // Create a new user
  const newUser = await UserService.createUser({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    globalEnabled: true,
    isPremium: false,
    status: 'active'
  })

  // Update user
  const updatedUser = await UserService.updateUser(newUser.id, {
    isPremium: true,
    streak: 10
  })

  // Get user with related data
  const userDetails = await UserService.getUserById(newUser.id)
  
  console.log('User with tasks:', userDetails?.tasks)
  console.log('User with messages:', userDetails?.messages)
}

// Example: Message Management
async function messageExamples() {
  // Get messages with filters
  const messages = await MessageService.getMessages({
    page: 1,
    limit: 20,
    type: 'support',
    status: 'pending',
    search: 'login problem'
  })

  // Create a new message
  const newMessage = await MessageService.createMessage({
    sender: 'user@example.com',
    title: 'Login Issue',
    type: 'support',
    message: 'I cannot log into my account',
    userId: 'user_123'
  })

  // Mark message as read
  await MessageService.markAsRead(newMessage.id)

  // Get message statistics
  const messageStats = await MessageService.getMessageStats()
  console.log('Pending messages:', messageStats.pending)
}

// Example: Task Management
async function taskExamples() {
  // Get tasks with filters
  const tasks = await TaskService.getTasks({
    page: 1,
    limit: 15,
    status: 'active',
    category: 'Mindfulness',
    difficulty: 'easy',
    userId: 'user_123'
  })

  // Create a new task
  const newTask = await TaskService.createTask({
    title: 'Daily Meditation',
    description: 'Meditate for 10 minutes',
    userId: 'user_123',
    userName: 'John Doe',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    category: 'Mindfulness',
    difficulty: 'easy',
    aiConfidence: 90
  })

  // Complete a task
  await TaskService.completeTask(newTask.id)

  // Get task categories
  const categories = await TaskService.getTaskCategories()
  console.log('Popular categories:', categories)

  // Expire overdue tasks
  await TaskService.expireOverdueTasks()
}

// Example: Notification Management
async function notificationExamples() {
  // Get notifications
  const notifications = await NotificationService.getNotifications({
    page: 1,
    limit: 10,
    type: 'motivation',
    status: 'active',
    targetGroup: 'premium_users'
  })

  // Create a notification
  const newNotification = await NotificationService.createNotification({
    title: 'Daily Motivation',
    message: 'You can do it! 💪',
    type: 'motivation',
    targetGroup: 'all',
    scheduledAt: new Date(),
    frequency: 'daily'
  })

  // Pause notification
  await NotificationService.pauseNotification(newNotification.id)

  // Get scheduled notifications
  const scheduled = await NotificationService.getScheduledNotifications()
  console.log('Notifications to send:', scheduled.length)
}

// Example: Billing Management
async function billingExamples() {
  // Get billing logs
  const billingLogs = await BillingService.getBillingLogs({
    page: 1,
    limit: 20,
    status: 'success',
    paymentMethod: 'credit_card',
    dateFrom: new Date('2025-01-01'),
    dateTo: new Date('2025-01-31')
  })

  // Create billing log
  const newBilling = await BillingService.createBillingLog({
    userId: 'user_123',
    userName: 'John Doe',
    amount: 29.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    description: 'Premium Monthly Subscription'
  })

  // Mark as successful
  await BillingService.markAsSuccess(newBilling.id)

  // Get revenue statistics
  const monthlyRevenue = await BillingService.getRevenueByPeriod('month')
  console.log('Monthly revenue:', monthlyRevenue.revenue)

  // Get user billing history
  const userBilling = await BillingService.getUserBillingHistory('user_123')
  console.log('User transactions:', userBilling.length)
}

// Example: Product Management
async function productExamples() {
  // Get products
  const products = await ProductService.getProducts({
    page: 1,
    limit: 10,
    type: 'subscription',
    isActive: true,
    priceMin: 10,
    priceMax: 100
  })

  // Create product
  const newProduct = await ProductService.createProduct({
    name: 'Premium Monthly',
    description: 'Monthly premium subscription',
    price: 29.99,
    currency: 'USD',
    type: 'subscription',
    duration: '1 month',
    isActive: true
  })

  // Get popular products
  const popular = await ProductService.getPopularProducts(5)
  console.log('Top products:', popular)

  // Increment subscribers
  await ProductService.incrementSubscribers(newProduct.id)
}

// Example: Role & Permission Management
async function rolePermissionExamples() {
  // Create permission
  const permission = await PermissionService.createPermission({
    name: 'user_management',
    description: 'Manage user accounts',
    category: 'User Management'
  })

  // Create role
  const role = await RoleService.createRole({
    name: 'Admin',
    description: 'System administrator',
    permissions: ['user_management', 'system_settings']
  })

  // Get permissions by category
  const userPermissions = await PermissionService.getPermissionsByCategory('User Management')
  console.log('User management permissions:', userPermissions)

  // Get all roles
  const allRoles = await RoleService.getAllRoles()
  console.log('Available roles:', allRoles.length)
}

// Example: Activity Logging
async function activityExamples() {
  // Log user activity
  await ActivityService.logUserActivity(
    'user_123',
    'login',
    'User logged in',
    'IP: 192.168.1.1, Browser: Chrome',
    'green'
  )

  // Log system activity
  await ActivityService.logSystemActivity(
    'maintenance',
    'System maintenance completed',
    'Database optimization finished',
    'blue'
  )

  // Get recent activities
  const recentActivities = await ActivityService.getRecentActivities(10)
  console.log('Recent activities:', recentActivities.length)

  // Get user activities
  const userActivities = await ActivityService.getUserActivities('user_123', 5)
  console.log('User activities:', userActivities.length)

  // Clean old activities
  await ActivityService.cleanOldActivities(30) // Keep last 30 days
}

// Example: User Blocking
async function blockingExamples() {
  // Check if user is blocked
  const isBlocked = await BlockedUserService.isUserBlocked('user@example.com', 'username')
  
  if (!isBlocked) {
    // Block user temporarily
    const blockedUser = await BlockedUserService.createBlockedUser({
      username: 'baduser',
      email: 'bad@example.com',
      reason: 'Spam activity',
      blockedBy: 'admin',
      status: 'temporary',
      blockedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    console.log('User blocked:', blockedUser.id)
  }

  // Clean up expired blocks
  await BlockedUserService.cleanupExpiredBlocks()

  // Get blocked users
  const blockedUsers = await BlockedUserService.getBlockedUsers({
    page: 1,
    limit: 10,
    status: 'active'
  })
  console.log('Blocked users:', blockedUsers.pagination.total)
}

// Example: Dashboard Data
async function dashboardExamples() {
  // Get comprehensive dashboard stats
  const dashboardStats = await DashboardService.getDashboardStats()
  console.log('Total users:', dashboardStats.users.total)
  console.log('Active users:', dashboardStats.users.active)
  console.log('Premium users:', dashboardStats.users.premium)

  // Get recent activities
  const activities = await DashboardService.getRecentActivities(10)
  console.log('Recent activities:', activities.length)

  // Get monthly statistics
  const monthlyStats = await DashboardService.getMonthlyStats()
  console.log('New registrations this month:', monthlyStats.newRegistrations)
  console.log('Premium conversion rate:', monthlyStats.premiumConversion + '%')

  // Get user growth data
  const growthData = await DashboardService.getUserGrowthData(12)
  console.log('User growth over 12 months:', growthData)

  // Get revenue data
  const revenueData = await DashboardService.getRevenueData(6)
  console.log('Revenue over 6 months:', revenueData)

  // Get top users
  const topUsers = await DashboardService.getTopUsers(10)
  console.log('Top users by streak:', topUsers)

  // Get popular categories
  const popularCategories = await DashboardService.getPopularCategories(5)
  console.log('Popular task categories:', popularCategories)
}

// Example: Error Handling
async function errorHandlingExample() {
  try {
    const user = await UserService.getUserById('non-existent-id')
    if (!user) {
      throw new Error('User not found')
    }
  } catch (error) {
    console.error('Error fetching user:', error.message)
  }

  try {
    await UserService.createUser({
      name: 'Test User',
      email: 'existing@example.com', // This might fail due to unique constraint
      globalEnabled: true,
      isPremium: false,
      status: 'active'
    })
  } catch (error) {
    console.error('Error creating user:', error.message)
  }
}

// Export examples for use in your application
export {
  userExamples,
  messageExamples,
  taskExamples,
  notificationExamples,
  billingExamples,
  productExamples,
  rolePermissionExamples,
  activityExamples,
  blockingExamples,
  dashboardExamples,
  errorHandlingExample
}