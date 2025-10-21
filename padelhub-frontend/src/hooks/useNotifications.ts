import { useState, useEffect, useCallback } from 'react';
import { notificationsService } from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationsService.getPermissionStatus()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      const subscribed = await notificationsService.isSubscribed();
      setIsSubscribed(subscribed);
    };

    if (notificationsService.isNotificationSupported()) {
      checkSubscription();
    }
  }, []);

  /**
   * Request notification permission and subscribe
   */
  const enableNotifications = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to enable notifications');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await notificationsService.subscribe(user.id);
      setPermission('granted');
      setIsSubscribed(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable notifications';
      setError(errorMessage);
      console.error('Error enabling notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Unsubscribe from notifications
   */
  const disableNotifications = useCallback(async () => {
    if (!user) {
      setError('You must be logged in');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await notificationsService.unsubscribe(user.id);
      setIsSubscribed(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable notifications';
      setError(errorMessage);
      console.error('Error disabling notifications:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Send a test notification
   */
  const sendTestNotification = useCallback(async () => {
    if (!user) {
      setError('You must be logged in');
      return false;
    }

    try {
      await notificationsService.sendTestNotification(user.id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      console.error('Error sending test notification:', err);
      return false;
    }
  }, [user]);

  return {
    permission,
    isSubscribed,
    isSupported: notificationsService.isNotificationSupported(),
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  };
}
