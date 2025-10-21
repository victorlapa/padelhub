import { Bell, BellOff, TestTube2 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationSettings() {
  const {
    permission,
    isSubscribed,
    isSupported,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  } = useNotifications();

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-yellow-600 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Push notifications are not supported in this browser. Please use a modern browser like
          Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      alert('Test notification sent! You should see it shortly.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">
              {isSubscribed
                ? "You'll receive notifications for upcoming matches"
                : 'Get notified when your matches are starting soon'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          className={`
            rounded-lg px-4 py-2 font-medium transition-colors
            ${
              isSubscribed
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Permission Status */}
      {permission !== 'granted' && permission !== 'default' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Notification permission has been denied. Please enable notifications in your browser
            settings to receive match alerts.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Test Notification Button (only if subscribed) */}
      {isSubscribed && (
        <button
          onClick={handleTestNotification}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <TestTube2 className="h-4 w-4" />
          Send Test Notification
        </button>
      )}

      {/* Info Section */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-900">What you'll be notified about:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Matches starting in 1 hour</li>
          <li>• Match cancellations or changes (coming soon)</li>
          <li>• When players join your matches (coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
