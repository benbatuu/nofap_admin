import { NextRequest, NextResponse } from 'next/server';
import { NotificationSendService } from '@/lib/services/notification-send.service';
import { APIError } from '@/lib/utils/api-response';

// Request/Response logging
function logRequest(method: string, url: string, params?: any) {
  console.log(`[${new Date().toISOString()}] ${method} ${url}`, params ? { params } : '');
}

function logResponse(method: string, url: string, success: boolean, duration: number) {
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${success ? 'SUCCESS' : 'ERROR'} (${duration}ms)`);
}

const notificationSendService = new NotificationSendService();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    const data = await request.json();
    
    logRequest('POST', url, { 
      userCount: data.userIds?.length || 0,
      title: data.title,
      type: data.type 
    });

    // Validate required fields
    if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userIds array is required and cannot be empty' 
        },
        { status: 400 }
      );
    }

    if (!data.title || !data.message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'title and message are required' 
        },
        { status: 400 }
      );
    }

    // Validate user IDs format
    const invalidIds = data.userIds.filter((id: any) => typeof id !== 'string' || id.trim().length === 0);
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All user IDs must be non-empty strings' 
        },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = ['motivation', 'dailyReminder', 'marketing', 'system'];
    const type = data.type || 'system';
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Send notification to specific users
    const result = await notificationSendService.sendToUsers(
      data.userIds,
      data.title,
      data.message,
      type,
      data.metadata
    );

    logResponse('POST', url, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Notification sent to ${result.totalTargeted} users. ${result.successCount} delivered, ${result.failureCount} failed.`
    });
  } catch (error) {
    logResponse('POST', url, false, Date.now() - startTime);
    console.error('Send notification to users API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send notification to users' },
      { status: 500 }
    );
  }
}