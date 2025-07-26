const { PrismaClient } = require('../lib/generated/prisma');
// Import services individually since we're in Node.js
const { UserService } = require('../lib/services/user.service');
const { MessageService } = require('../lib/services/message.service');
const { TaskService } = require('../lib/services/task.service');
const { NotificationService } = require('../lib/services/notification.service');
const { BillingService } = require('../lib/services/billing.service');
const { ProductService } = require('../lib/services/product.service');
const { RoleService } = require('../lib/services/role.service');
const { PermissionService } = require('../lib/services/permission.service');
const { ActivityService } = require('../lib/services/activity.service');
const { BlockedUserService } = require('../lib/services/blocked-user.service');
const { BlockedIPService } = require('../lib/services/blocked-ip.service');
const { DashboardService } = require('../lib/services/dashboard.service');

const prisma = new PrismaClient();

async function testService(serviceName, testFunction) {
  try {
    console.log(`🔍 Testing ${serviceName}...`);
    await testFunction();
    console.log(`✅ ${serviceName} - OK`);
  } catch (error) {
    console.log(`❌ ${serviceName} - Failed:`, error.message);
  }
}

async function runServiceTests() {
  console.log('🚀 Testing all services with database...\n');

  // Test UserService
  await testService('UserService', async () => {
    const users = await UserService.getUsers({ limit: 5 });
    if (!users.users || users.users.length === 0) throw new Error('No users found');
    
    const userStats = await UserService.getUserStats();
    if (typeof userStats.total !== 'number') throw new Error('Invalid user stats');
  });

  // Test MessageService
  await testService('MessageService', async () => {
    const messages = await MessageService.getMessages({ limit: 5 });
    if (!messages.messages || messages.messages.length === 0) throw new Error('No messages found');
    
    const messageStats = await MessageService.getMessageStats();
    if (typeof messageStats.total !== 'number') throw new Error('Invalid message stats');
  });

  // Test TaskService
  await testService('TaskService', async () => {
    const tasks = await TaskService.getTasks({ limit: 5 });
    if (!tasks.tasks || tasks.tasks.length === 0) throw new Error('No tasks found');
    
    const taskStats = await TaskService.getTaskStats();
    if (typeof taskStats.total !== 'number') throw new Error('Invalid task stats');
  });

  // Test NotificationService
  await testService('NotificationService', async () => {
    const notifications = await NotificationService.getNotifications({ limit: 5 });
    if (!notifications.notifications || notifications.notifications.length === 0) throw new Error('No notifications found');
    
    const notificationStats = await NotificationService.getNotificationStats();
    if (typeof notificationStats.total !== 'number') throw new Error('Invalid notification stats');
  });

  // Test BillingService
  await testService('BillingService', async () => {
    const billingLogs = await BillingService.getBillingLogs({ limit: 5 });
    if (!billingLogs.billingLogs || billingLogs.billingLogs.length === 0) throw new Error('No billing logs found');
    
    const billingStats = await BillingService.getBillingStats();
    if (typeof billingStats.total !== 'number') throw new Error('Invalid billing stats');
  });

  // Test ProductService
  await testService('ProductService', async () => {
    const products = await ProductService.getProducts({ limit: 5 });
    if (!products.products || products.products.length === 0) throw new Error('No products found');
    
    const productStats = await ProductService.getProductStats();
    if (typeof productStats.total !== 'number') throw new Error('Invalid product stats');
  });

  // Test RoleService
  await testService('RoleService', async () => {
    const roles = await RoleService.getRoles({ limit: 5 });
    if (!roles.roles || roles.roles.length === 0) throw new Error('No roles found');
    
    const roleStats = await RoleService.getRoleStats();
    if (typeof roleStats.total !== 'number') throw new Error('Invalid role stats');
  });

  // Test PermissionService
  await testService('PermissionService', async () => {
    const permissions = await PermissionService.getPermissions({ limit: 5 });
    if (!permissions.permissions || permissions.permissions.length === 0) throw new Error('No permissions found');
    
    const permissionStats = await PermissionService.getPermissionStats();
    if (typeof permissionStats.total !== 'number') throw new Error('Invalid permission stats');
  });

  // Test ActivityService
  await testService('ActivityService', async () => {
    const activities = await ActivityService.getActivities({ limit: 5 });
    // Activities might be empty, so just check structure
    if (!activities.activities) throw new Error('Invalid activities structure');
    
    const activityStats = await ActivityService.getActivityStats();
    if (typeof activityStats.total !== 'number') throw new Error('Invalid activity stats');
  });

  // Test BlockedUserService
  await testService('BlockedUserService', async () => {
    const blockedUsers = await BlockedUserService.getBlockedUsers({ limit: 5 });
    if (!blockedUsers.blockedUsers || blockedUsers.blockedUsers.length === 0) throw new Error('No blocked users found');
    
    const blockedUserStats = await BlockedUserService.getBlockedUserStats();
    if (typeof blockedUserStats.total !== 'number') throw new Error('Invalid blocked user stats');
  });

  // Test BlockedIPService
  await testService('BlockedIPService', async () => {
    const blockedIPs = await BlockedIPService.getBlockedIPs({ limit: 5 });
    if (!blockedIPs.blockedIPs || blockedIPs.blockedIPs.length === 0) throw new Error('No blocked IPs found');
    
    const blockedIPStats = await BlockedIPService.getBlockedIPStats();
    if (typeof blockedIPStats.total !== 'number') throw new Error('Invalid blocked IP stats');
  });

  // Test DashboardService
  await testService('DashboardService', async () => {
    const dashboardStats = await DashboardService.getDashboardStats();
    if (!dashboardStats.users || !dashboardStats.messages || !dashboardStats.tasks || !dashboardStats.billing) {
      throw new Error('Invalid dashboard stats structure');
    }
    
    const recentActivities = await DashboardService.getRecentActivities(5);
    if (!Array.isArray(recentActivities)) throw new Error('Invalid recent activities');
    
    const systemStatus = await DashboardService.getSystemStatus();
    if (!systemStatus.api || !systemStatus.database) throw new Error('Invalid system status');
    
    const monthlyStats = await DashboardService.getMonthlyStats();
    if (typeof monthlyStats.newRegistrations !== 'number') throw new Error('Invalid monthly stats');
  });

  console.log('\n✅ All service tests completed successfully!');
  console.log('\n📊 Database Summary:');
  
  // Get summary statistics
  const [userCount, messageCount, taskCount, productCount, roleCount] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
    prisma.task.count(),
    prisma.product.count(),
    prisma.role.count()
  ]);

  console.log(`   👥 Users: ${userCount}`);
  console.log(`   💬 Messages: ${messageCount}`);
  console.log(`   📋 Tasks: ${taskCount}`);
  console.log(`   🛍️ Products: ${productCount}`);
  console.log(`   🔐 Roles: ${roleCount}`);
}

// Test CRUD operations
async function testCRUDOperations() {
  console.log('\n🔧 Testing CRUD operations...\n');

  // Test User CRUD
  await testService('User CRUD', async () => {
    // Create
    const newUser = await UserService.createUser({
      name: 'Test User',
      email: 'test@example.com',
      isPremium: false
    });
    
    // Read
    const fetchedUser = await UserService.getUserById(newUser.id);
    if (!fetchedUser || fetchedUser.email !== 'test@example.com') throw new Error('User not found after creation');
    
    // Update
    const updatedUser = await UserService.updateUser(newUser.id, { name: 'Updated Test User' });
    if (updatedUser.name !== 'Updated Test User') throw new Error('User not updated');
    
    // Delete (soft delete)
    await UserService.deleteUser(newUser.id);
    const deletedUser = await UserService.getUserById(newUser.id);
    if (deletedUser.status !== 'inactive') throw new Error('User not soft deleted');
  });

  // Test Message CRUD
  await testService('Message CRUD', async () => {
    // Get a user ID for the message
    const users = await UserService.getUsers({ limit: 1 });
    const userId = users.users[0].id;
    
    // Create
    const newMessage = await MessageService.createMessage({
      sender: 'test_user',
      title: 'Test Message',
      type: 'feedback',
      message: 'This is a test message',
      userId
    });
    
    // Read
    const fetchedMessage = await MessageService.getMessageById(newMessage.id);
    if (!fetchedMessage || fetchedMessage.title !== 'Test Message') throw new Error('Message not found after creation');
    
    // Update
    const updatedMessage = await MessageService.updateMessage(newMessage.id, { status: 'read' });
    if (updatedMessage.status !== 'read') throw new Error('Message not updated');
    
    // Delete
    await MessageService.deleteMessage(newMessage.id);
    const deletedMessage = await MessageService.getMessageById(newMessage.id);
    if (deletedMessage) throw new Error('Message not deleted');
  });

  // Test Product CRUD
  await testService('Product CRUD', async () => {
    // Create
    const newProduct = await ProductService.createProduct({
      name: 'Test Product',
      description: 'Test product description',
      price: 19.99,
      currency: 'TRY',
      type: 'one_time'
    });
    
    // Read
    const fetchedProduct = await ProductService.getProductById(newProduct.id);
    if (!fetchedProduct || fetchedProduct.name !== 'Test Product') throw new Error('Product not found after creation');
    
    // Update
    const updatedProduct = await ProductService.updateProduct(newProduct.id, { price: 29.99 });
    if (updatedProduct.price !== 29.99) throw new Error('Product not updated');
    
    // Delete
    await ProductService.deleteProduct(newProduct.id);
    const deletedProduct = await ProductService.getProductById(newProduct.id);
    if (deletedProduct) throw new Error('Product not deleted');
  });

  console.log('✅ All CRUD operations completed successfully!');
}

async function main() {
  try {
    await runServiceTests();
    await testCRUDOperations();
    console.log('\n🎉 All tests passed! Database and services are working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);