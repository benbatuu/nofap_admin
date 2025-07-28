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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    logRequest('GET', url);

    // Get segmentation statistics
    const stats = await notificationSendService.getSegmentationStats();

    logResponse('GET', url, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logResponse('GET', url, false, Date.now() - startTime);
    console.error('Get segmentation stats API error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to get segmentation statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    const data = await request.json();
    
    logRequest('POST', url, { 
      segmentType: data.segment?.type,
      title: data.title,
      type: data.type 
    });

    // Validate required fields
    if (!data.segment || !data.segment.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'segment with type is required' 
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

    // Validate segment type
    const validSegmentTypes = [
      'all', 'premium', 'free', 'active', 'inactive', 
      'high_streak', 'low_streak', 'recent_relapse', 'custom'
    ];
    if (!validSegmentTypes.includes(data.segment.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid segment type. Must be one of: ${validSegmentTypes.join(', ')}` 
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

    // Validate custom segment criteria if needed
    if (data.segment.type === 'custom' && !data.segment.criteria) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'criteria is required for custom segment type' 
        },
        { status: 400 }
      );
    }

    // Send notification to segment
    const result = await notificationSendService.sendToSegment(
      data.segment,
      data.title,
      data.message,
      type,
      data.metadata
    );

    logResponse('POST', url, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Notification sent to ${result.totalTargeted} users in segment '${data.segment.type}'. ${result.successCount} delivered, ${result.failureCount} failed.`
    });
  } catch (error) {
    logResponse('POST', url, false, Date.now() - startTime);
    console.error('Send notification to segment API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send notification to segment' },
      { status: 500 }
    );
  }
}