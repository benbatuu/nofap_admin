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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const url = request.url;
  
  try {
    logRequest('GET', url);

    const targetGroups = await scheduledNotificationService.getTargetGroups();

    logResponse('GET', url, true, Date.now() - startTime);

    return NextResponse.json({
      success: true,
      data: {
        targetGroups,
        totalGroups: targetGroups.length
      },
      message: 'Target groups retrieved successfully'
    });
  } catch (error) {
    logResponse('GET', url, false, Date.now() - startTime);
    console.error('Get target groups API error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get target groups' },
      { status: 500 }
    );
  }
}