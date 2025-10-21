import { apiClient } from './api';

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export interface NotificationHistoryItem {
  id: string;
  userId: string;
  matchId?: string;
  type: string;
  status: string;
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  sentAt?: string;
}

class NotificationsService {
  private vapidPublicKey: string | null = null;

  /**
   * Get the VAPID public key from the backend
   */
  async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    const response = await apiClient.get<{ publicKey: string }>(
      '/notifications/vapid-public-key'
    );
    this.vapidPublicKey = response.data.publicKey;
    return this.vapidPublicKey;
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('This browser does not support service workers');
    }

    return await Notification.requestPermission();
  }

  /**
   * Check if notifications are supported and permitted
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Convert base64 VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(userId: string): Promise<void> {
    // Check permission
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key
    const vapidPublicKey = await this.getVapidPublicKey();
    const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Convert subscription to JSON
    const subscriptionJson = subscription.toJSON();

    if (!subscriptionJson.endpoint || !subscriptionJson.keys) {
      throw new Error('Invalid subscription');
    }

    // Send subscription to backend
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscriptionJson.endpoint,
      p256dh: subscriptionJson.keys.p256dh!,
      auth: subscriptionJson.keys.auth!,
      userAgent: navigator.userAgent,
    };

    await apiClient.post('/notifications/subscribe', {
      userId,
      ...subscriptionData,
    });
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(userId: string): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from browser
      await subscription.unsubscribe();

      // Notify backend
      await apiClient.post('/notifications/unsubscribe', {
        userId,
        endpoint: subscription.endpoint,
      });
    }
  }

  /**
   * Check if user is currently subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isNotificationSupported()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  /**
   * Get user's active subscriptions from backend
   */
  async getUserSubscriptions(userId: string) {
    const response = await apiClient.get(`/notifications/subscriptions/${userId}`);
    return response.data;
  }

  /**
   * Get user's notification history
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<NotificationHistoryItem[]> {
    const response = await apiClient.get<{ notifications: NotificationHistoryItem[] }>(
      `/notifications/history/${userId}?limit=${limit}`
    );
    return response.data.notifications;
  }

  /**
   * Send a test notification (development only)
   */
  async sendTestNotification(
    userId: string,
    title: string = 'Test Notification',
    body: string = 'This is a test notification from PadelHub!'
  ): Promise<void> {
    await apiClient.post('/notifications/test', {
      userId,
      title,
      body,
    });
  }
}

export const notificationsService = new NotificationsService();
