import { useState, useEffect, useCallback } from "react";

/**
 * Hook to detect user activity (mouse movement, clicks, key presses, touch)
 * Returns true if user has been active recently
 *
 * @param inactivityTimeout - Time in ms before considering user inactive (default: 30s)
 */
export function useUserActivity(inactivityTimeout: number = 30000): boolean {
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
    setIsActive(true);
  }, []);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity detection to avoid excessive state updates
    let throttleTimeout: NodeJS.Timeout | null = null;

    const throttledHandleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 1000); // Update at most once per second
      }
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, throttledHandleActivity);
    });

    // Check for inactivity periodically
    const inactivityInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > inactivityTimeout) {
        setIsActive(false);
      }
    }, 5000); // Check every 5 seconds

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledHandleActivity);
      });
      clearInterval(inactivityInterval);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [handleActivity, inactivityTimeout, lastActivity]);

  return isActive;
}
