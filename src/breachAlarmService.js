/**
 * Breach Alarm Service
 * Handles audio notifications and visual alerts for password breaches
 */

// Create a simple beep/alarm sound using Web Audio API
function createAlarmSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create oscillator for alarm tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency for alert tone (use two frequencies for pulse effect)
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.setValueAtTime(600, now + 0.2);
    oscillator.frequency.setValueAtTime(800, now + 0.4);
    
    // Control volume
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    oscillator.start(now);
    oscillator.stop(now + 0.8);
    
    return true;
  } catch (err) {
    console.error('Could not create alarm sound:', err);
    return false;
  }
}

/**
 * Plays a breach alarm sound
 * @param {number} count - Number of times to repeat the alarm
 */
export const playBreachAlarm = (count = 3) => {
  let playCount = 0;
  
  const playNext = () => {
    if (playCount < count) {
      createAlarmSound();
      playCount++;
      // Play next alarm after 1 second
      setTimeout(playNext, 1000);
    }
  };
  
  playNext();
};

/**
 * Creates a visible notification for breach alert
 * @param {string} message - Message to display
 * @param {Function} onDismiss - Callback when user dismisses
 */
export const showBreachNotification = (message, onDismiss = null) => {
  // Check if Notification API is available
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('🚨 PassProtector Breach Alert', {
        body: message,
        icon: '🔐',
        tag: 'breach-alert',
        requireInteraction: true,
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(() => {
        new Notification('🚨 PassProtector Breach Alert', {
          body: message,
          icon: '🔐',
          tag: 'breach-alert',
          requireInteraction: true,
        });
      });
    }
  }
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }
  return Notification.permission === 'granted';
};

/**
 * Trigger full breach alert (sound + notification)
 * @param {number} breachedCount - Number of breached passwords
 * @param {Function} onDismiss - Callback when dismissed
 */
export const triggerBreachAlert = async (breachedCount, onDismiss = null) => {
  // Play audio alarm (3 times)
  playBreachAlarm(3);
  
  // Request and show notification
  await requestNotificationPermission();
  
  const message = breachedCount === 1
    ? '1 password has been found in a public breach!'
    : `${breachedCount} passwords have been found in public breaches!`;
  
  showBreachNotification(message, onDismiss);
};

/**
 * Returns whether the browser supports Web Audio API
 */
export const supportsAudio = () => {
  return !!(window.AudioContext || window.webkitAudioContext);
};

/**
 * Returns whether the browser supports Notifications
 */
export const supportsNotifications = () => {
  return 'Notification' in window;
};
