import { NextRequest, NextResponse } from 'next/server';
import { ScheduledNotificationService } from '@/lib/services/scheduled-notification.service';
import { APIError } from '@/lib/utils/api-response';

const scheduledNotificationService = new ScheduledNotificationService();

// Request/Response logging
function logRequest(method: string, url: string, params?: any) {
  console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '');
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const processAll = searchParams.get('all') === 'true';

    logRequest('POST', url, { notificationId, processAll });

    if (processAll) {
      // Process all scheduled notifications that are due
      const results = await scheduledNotificationService.processAllScheduledNotifications();
      
      logResponse('POST', url, true, Date.now() - startTime);

      return NextResponse.json({
        success: true,
        data: {
          processedCount: results.length,
          results: results.map(result => ({
            notificationId: result.notificationId,
            totalTargeted: result.totalTargeted,
            successfulDeliveries: result.successfulDeliveries,
            failedDeliveries: result.failedDeliveries
          }))
        },
        message: `Processed ${results.length} scheduled notifications`
      });
    } else if (notificationId) {
      // Process specific notification
      const result = await scheduledNotificationService.processScheduledNotification(notificationId);
      
      logResponse('POST', url, true, Date.now() - startTime);

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Notification processed successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either notification ID or "all=true" parameter is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    logResponse('POST', url, false, Date.now() - startTime);
    console.error('Process scheduled notification API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process scheduled notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    const { searchParams } = new URL(request.url);
    const overdue = searchParams.get('overdue') === 'true';

    logRequest('GET', url, { overdue });

    let notifications;
    if (overdue) {
      notifications = await scheduledNotificationService.getOverdueNotifications();
    } else {
      notifications = await scheduledNotificationService.getScheduledNotifications();
    }

    logResponse('GET', url, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        count: notifications.length
      },
      message: `Found ${notifications.length} ${overdue ? 'overdue' : 'scheduled'} notifications`
    });
  } catch (error) {
    logResponse('GET', url, false, Date.now() - startTime);
    console.error('Get scheduled notifications API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get scheduled notifications' },
      { status: 500 }
    );
  }
}