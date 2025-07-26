const { PrismaClient } = require('../lib/generated/prisma');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user count
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test message count
    const messageCount = await prisma.message.count();
    console.log(`💬 Messages in database: ${messageCount}`);
    
    // Test task count
    const taskCount = await prisma.task.count();
    console.log(`📋 Tasks in database: ${taskCount}`);
    
    // Test recent activity
    const recentActivity = await prisma.activity.findFirst({
      orderBy: { timestamp: 'desc' }
    });
    
    if (recentActivity) {
      console.log(`🔄 Latest activity: ${recentActivity.message}`);
    }
    
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();