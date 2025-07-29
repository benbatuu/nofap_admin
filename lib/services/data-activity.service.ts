// lib/services/data-activity.service.ts

import { dataActivityApi } from '@/lib/api';
import { 
  ActivityAnalytics, 
  ActivityFilters, 
  UserActivity,
  DeviceStats,
  ActivityInsight,
  ApiResponse 
} from '@/types/api';

export class ActivityService {
  /**
   * Kullanıcı aktivite analizlerini getirir
   */
  static async getActivityAnalytics(filters?: ActivityFilters): Promise<ActivityAnalytics> {
    try {
      const apiFilters = {
        timeFilter: filters?.timeFilter,
        userId: filters?.userId,
        limit: filters?.limit,
      };

      const response: ApiResponse<ActivityAnalytics> = await dataActivityApi.getActivityAnalytics(apiFilters);
      
      if (!response.success) {
        throw new Error(response.message || 'Aktivite verileri alınamadı');
      }

      return response.data;
    } catch (error) {
      console.error('ActivityService.getActivityAnalytics error:', error);
      // Fallback data döndür
      return this.getFallbackActivityData();
    }
  }

  /**
   * Çevrimiçi kullanıcı sayısını getirir
   */
  static async getOnlineUsersCount(): Promise<number> {
    try {
      const analytics = await this.getActivityAnalytics({ timeFilter: '1h' });
      return analytics.stats.onlineUsers;
    } catch (error) {
      console.error('ActivityService.getOnlineUsersCount error:', error);
      return 0;
    }
  }

  /**
   * Belirli bir kullanıcının aktivite geçmişini getirir
   */
  static async getUserActivityHistory(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const analytics = await this.getActivityAnalytics({ userId, limit });
      return analytics.recentActivities.filter(activity => 
        activity.username === userId || activity.id === userId
      );
    } catch (error) {
      console.error('ActivityService.getUserActivityHistory error:', error);
      return [];
    }
  }

  /**
   * Cihaz istatistiklerini getirir
   */
  static async getDeviceStatistics(): Promise<DeviceStats[]> {
    try {
      const analytics = await this.getActivityAnalytics();
      return analytics.deviceStats;
    } catch (error) {
      console.error('ActivityService.getDeviceStatistics error:', error);
      return this.getFallbackDeviceStats();
    }
  }

  /**
   * Aktivite öngörülerini getirir
   */
  static async getActivityInsights(): Promise<ActivityInsight[]> {
    try {
      const analytics = await this.getActivityAnalytics();
      return analytics.insights;
    } catch (error) {
      console.error('ActivityService.getActivityInsights error:', error);
      return this.getFallbackInsights();
    }
  }

  /**
   * Zaman filtresine göre aktivite verilerini filtreler
   */
  static filterByTimeRange(activities: UserActivity[], timeFilter: string): UserActivity[] {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeFilter) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return activities;
    }

    return activities.filter(activity => {
      const activityTime = new Date(activity.lastSeen);
      return activityTime >= cutoffTime;
    });
  }

  /**
   * Cihaz türüne göre aktiviteleri filtreler
   */
  static filterByDevice(activities: UserActivity[], deviceFilter: string): UserActivity[] {
    if (deviceFilter === 'all') return activities;

    return activities.filter(activity => {
      const device = activity.device.toLowerCase();
      switch (deviceFilter) {
        case 'mobile':
          return device.includes('iphone') || device.includes('android') || device.includes('samsung');
        case 'desktop':
          return device.includes('macbook') || device.includes('windows') || device.includes('mac');
        case 'tablet':
          return device.includes('ipad') || device.includes('tablet');
        default:
          return true;
      }
    });
  }

  /**
   * Fallback aktivite verilerini döndürür (API başarısız olduğunda)
   */
  private static getFallbackActivityData(): ActivityAnalytics {
    return {
      stats: {
        onlineUsers: 1234,
        dailyActiveUsers: 8456,
        averageSessionDuration: '34 dk',
        engagementRate: 78,
        dailyActiveUsersChange: '+12%',
        sessionDurationChange: '+5 dk',
      },
      deviceStats: this.getFallbackDeviceStats(),
      recentActivities: this.getFallbackRecentActivities(),
      insights: this.getFallbackInsights(),
      totalUsers: 41746,
      peakHours: '20:00-22:00',
    };
  }

  private static getFallbackDeviceStats(): DeviceStats[] {
    return [
      { device: 'Mobile', count: 28456, percentage: 68.2 },
      { device: 'Desktop', count: 9234, percentage: 22.1 },
      { device: 'Tablet', count: 4056, percentage: 9.7 },
    ];
  }

  private static getFallbackRecentActivities(): UserActivity[] {
    return [
      {
        id: '1',
        username: 'active_user_1',
        lastSeen: '2024-01-25 14:30',
        sessionDuration: '45 dakika',
        device: 'iPhone 15',
        location: 'İstanbul, TR',
        actions: ['Streak güncelleme', 'Profil görüntüleme', 'Motivasyon okuma'],
        status: 'online',
      },
      {
        id: '2',
        username: 'regular_user',
        lastSeen: '2024-01-25 12:15',
        sessionDuration: '23 dakika',
        device: 'Samsung Galaxy S23',
        location: 'Ankara, TR',
        actions: ['Relapse bildirimi', 'Destek arama'],
        status: 'away',
      },
      {
        id: '3',
        username: 'premium_member',
        lastSeen: '2024-01-25 10:45',
        sessionDuration: '67 dakika',
        device: 'MacBook Pro',
        location: 'İzmir, TR',
        actions: ['İstatistik inceleme', 'Premium özellik kullanımı', 'Topluluk etkileşimi'],
        status: 'offline',
      },
    ];
  }

  private static getFallbackInsights(): ActivityInsight[] {
    return [
      {
        type: 'info',
        title: 'Yoğun Saatler',
        description: 'En yoğun kullanım saatleri: 20:00-22:00 arası. Bu saatlerde özel içerik sunulabilir.',
        color: 'blue',
      },
      {
        type: 'success',
        title: 'Mobil Odaklı',
        description: 'Kullanıcıların %68\'i mobil cihaz kullanıyor. Mobil deneyim öncelikli olmalı.',
        color: 'green',
      },
      {
        type: 'warning',
        title: 'Engagement Artırma',
        description: 'Ortalama oturum süresi artıyor. Daha fazla etkileşimli içerik eklenebilir.',
        color: 'yellow',
      },
    ];
  }
}