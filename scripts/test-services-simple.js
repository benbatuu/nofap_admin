const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function testDatabaseOperations() {
  console.log('🚀 Testing database operations and services...\n');

  try {
    // Test basic database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection - OK');

    // Test User operations
    console.log('🔍 Testing User operations...');
    const users = await prisma.user.findMany({ take: 5 });
    console.log(`✅ Users found: ${users.length}`);
    
    const userStats = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { isPremium: true } }),
      prisma.user.count({ where: { status: 'banned' } })
    ]);
    console.log(`   📊 Total: ${userStats[0]}, Active: ${userStats[1]}, Premium: ${userStats[2]}, Banned: ${userStats[3]}`);

    // Test Message operations
    console.log('🔍 Testing Message operations...');
    const messages = await prisma.message.findMany({ 
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    });
    console.log(`✅ Messages found: ${messages.length}`);
    
    const messageStats = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: 'pending' } }),
      prisma.message.count({ where: { status: 'read' } }),
      prisma.message.count({ where: { status: 'replied' } })
    ]);
    console.log(`   📊 Total: ${messageStats[0]}, Pending: ${messageStats[1]}, Read: ${messageStats[2]}, Replied: ${messageStats[3]}`);

    // Test Task operations
    console.log('🔍 Testing Task operations...');
    const tasks = await prisma.task.findMany({ 
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    });
    console.log(`✅ Tasks found: ${tasks.length}`);
    
    const taskStats = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'active' } }),
      prisma.task.count({ where: { status: 'completed' } }),
      prisma.task.count({ where: { status: 'expired' } })
    ]);
    console.log(`   📊 Total: ${taskStats[0]}, Active: ${taskStats[1]}, Completed: ${taskStats[2]}, Expired: ${taskStats[3]}`);

    // Test Product operations
    console.log('🔍 Testing Product operations...');
    const products = await prisma.product.findMany({ take: 5 });
    console.log(`✅ Products found: ${products.length}`);
    
    const productStats = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { type: 'subscription' } }),
      prisma.product.count({ where: { type: 'one_time' } })
    ]);
    console.log(`   📊 Total: ${productStats[0]}, Active: ${productStats[1]}, Subscription: ${productStats[2]}, One-time: ${productStats[3]}`);

    // Test Billing operations
    console.log('🔍 Testing Billing operations...');
    const billingLogs = await prisma.billingLog.findMany({ 
      take: 5,
      include: { user: { select: { name: true, email: true } } }
    });
    console.log(`✅ Billing logs found: ${billingLogs.length}`);
    
    const billingStats = await Promise.all([
      prisma.billingLog.count(),
      prisma.billingLog.count({ where: { status: 'success' } }),
      prisma.billingLog.count({ where: { status: 'pending' } }),
      prisma.billingLog.count({ where: { status: 'failed' } })
    ]);
    
    const totalRevenue = await prisma.billingLog.aggregate({
      where: { status: 'success' },
      _sum: { amount: true }
    });
    
    console.log(`   📊 Total: ${billingStats[0]}, Success: ${billingStats[1]}, Pending: ${billingStats[2]}, Failed: ${billingStats[3]}`);
    console.log(`   💰 Total Revenue: ${totalRevenue._sum.amount || 0} TRY`);

    // Test Role operations
    console.log('🔍 Testing Role operations...');
    const roles = await prisma.role.findMany({ take: 5 });
    console.log(`✅ Roles found: ${roles.length}`);
    console.log(`   📋 Sample role: ${roles[0]?.name} - ${roles[0]?.description}`);

    // Test Permission operations
    console.log('🔍 Testing Permission operations...');
    const permissions = await prisma.permission.findMany({ take: 5 });
    console.log(`✅ Permissions found: ${permissions.length}`);
    console.log(`   🔐 Sample permission: ${permissions[0]?.name} - ${permissions[0]?.description}`);

    // Test Notification operations
    console.log('🔍 Testing Notification operations...');
    const notifications = await prisma.notification.findMany({ take: 5 });
    console.log(`✅ Notifications found: ${notifications.length}`);
    
    const notificationStats = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'active' } }),
      prisma.notification.count({ where: { status: 'completed' } }),
      prisma.notification.count({ where: { status: 'paused' } })
    ]);
    console.log(`   📊 Total: ${notificationStats[0]}, Active: ${notificationStats[1]}, Completed: ${notificationStats[2]}, Paused: ${notificationStats[3]}`);

    // Test Activity operations
    console.log('🔍 Testing Activity operations...');
    const activities = await prisma.activity.findMany({ 
      take: 5,
      include: { user: { select: { name: true } } }
    });
    console.log(`✅ Activities found: ${activities.length}`);

    // Test BlockedUser operations
    console.log('🔍 Testing BlockedUser operations...');
    const blockedUsers = await prisma.blockedUser.findMany({ take: 5 });
    console.log(`✅ Blocked users found: ${blockedUsers.length}`);

    // Test BlockedIP operations
    console.log('🔍 Testing BlockedIP operations...');
    const blockedIPs = await prisma.blockedIP.findMany({ take: 5 });
    console.log(`✅ Blocked IPs found: ${blockedIPs.length}`);

    // Test CRUD operations
    console.log('\n🔧 Testing CRUD operations...');
    
    // Create a test user
    console.log('🔍 Testing User CRUD...');
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        globalEnabled: true,
        notifications: { test: true },
        lastActivity: new Date(),
        streak: 0,
        isPremium: false,
        status: 'active'
      }
    });
    console.log(`✅ User created: ${testUser.name} (${testUser.id})`);
    
    // Update the test user
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Test User', streak: 5 }
    });
    console.log(`✅ User updated: ${updatedUser.name}, streak: ${updatedUser.streak}`);
    
    // Create a test message for the user
    const testMessage = await prisma.message.create({
      data: {
        sender: 'test_sender',
        title: 'Test Message',
        type: 'feedback',
        message: 'This is a test message',
        status: 'pending',
        userId: testUser.id
      }
    });
    console.log(`✅ Message created: ${testMessage.title} (${testMessage.id})`);
    
    // Create a test task for the user
    const testTask = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'active',
        aiConfidence: 85,
        userId: testUser.id,
        userName: testUser.name,
        createdDate: new Date(),
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        category: 'Test',
        difficulty: 'easy'
      }
    });
    console.log(`✅ Task created: ${testTask.title} (${testTask.id})`);
    
    // Clean up test data
    await prisma.task.delete({ where: { id: testTask.id } });
    await prisma.message.delete({ where: { id: testMessage.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All database operations completed successfully!');
    console.log('\n📊 Final Database Summary:');
    
    const finalStats = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.task.count(),
      prisma.product.count(),
      prisma.role.count(),
      prisma.permission.count(),
      prisma.notification.count(),
      prisma.billingLog.count(),
      prisma.activity.count(),
      prisma.blockedUser.count(),
      prisma.blockedIP.count()
    ]);

    console.log(`   👥 Users: ${finalStats[0]}`);
    console.log(`   💬 Messages: ${finalStats[1]}`);
    console.log(`   📋 Tasks: ${finalStats[2]}`);
    console.log(`   🛍️ Products: ${finalStats[3]}`);
    console.log(`   🔐 Roles: ${finalStats[4]}`);
    console.log(`   🔑 Permissions: ${finalStats[5]}`);
    console.log(`   🔔 Notifications: ${finalStats[6]}`);
    console.log(`   💳 Billing Logs: ${finalStats[7]}`);
    console.log(`   📈 Activities: ${finalStats[8]}`);
    console.log(`   🚫 Blocked Users: ${finalStats[9]}`);
    console.log(`   🚫 Blocked IPs: ${finalStats[10]}`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseOperations().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});