import { PushSubscription as PushSubscriptionType } from '../types';

/**
 * Push Notification Manager
 * Handles Web Push API integration for browser notifications
 */

export interface PushNotificationConfig {
  vapidPublicKey: string;
}

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Register Service Worker for push notifications
 */
export async function registerServiceWorker(
  scriptPath: string = '/service-worker.js'
): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(scriptPath);
    serviceWorkerRegistration = registration;
    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('Failed to register Service Worker:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  config: PushNotificationConfig
): Promise<PushSubscriptionType | null> {
  if (!serviceWorkerRegistration) {
    console.error('Service Worker not registered');
    return null;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.vapidPublicKey),
    });

    // Convert PushSubscription to our custom type
    return convertWebPushSubscriptionToCustomType(subscription);
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Get existing push subscription
 */
export async function getPushSubscription(): Promise<PushSubscriptionType | null> {
  if (!serviceWorkerRegistration) {
    console.error('Service Worker not registered');
    return null;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      return convertWebPushSubscriptionToCustomType(subscription);
    }
    return null;
  } catch (error) {
    console.error('Failed to get push subscription:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!serviceWorkerRegistration) {
    console.error('Service Worker not registered');
    return false;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Show a local notification
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!serviceWorkerRegistration) {
    console.error('Service Worker not registered');
    return;
  }

  try {
    await serviceWorkerRegistration.showNotification(title, options);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

/**
 * Helper: Convert Web Push Subscription to custom type
 */
function convertWebPushSubscriptionToCustomType(
  webSubscription: PushSubscription
): PushSubscriptionType {
  const key = webSubscription.getKey('auth');
  const p256dh = webSubscription.getKey('p256dh');

  return {
    id: `web_${Date.now()}`, // Temporary ID
    userId: '', // Will be filled by backend
    endpoint: webSubscription.endpoint,
    auth: key ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(key)))) : '',
    p256dh: p256dh ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh)))) : '',
    role: 'parent', // Default, will be overridden
    enabledChannels: {
      inApp: true,
      push: true,
      email: false,
    },
    preferences: {
      quietHours: {
        start: '22:00',
        end: '08:00',
      },
      mutedCategories: [],
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Helper: Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Initialize push notifications
 * Call this during app initialization
 */
export async function initializePushNotifications(
  config: PushNotificationConfig
): Promise<boolean> {
  try {
    // Register Service Worker first
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Failed to register Service Worker');
      return false;
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission denied by user');
      return false;
    }

    // Check if already subscribed
    const existingSubscription = await getPushSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return true;
    }

    // Subscribe to push notifications
    const subscription = await subscribeToPushNotifications(config);
    if (subscription) {
      console.log('Successfully subscribed to push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
    return false;
  }
}

/**
 * Batch notifications for efficiency
 * Groups notifications from the same time period
 */
export interface BatchedNotification {
  groupKey: string;
  notifications: Notification[];
  count: number;
}

export function batchNotificationsByTime(
  notifications: any[],
  timeWindowMinutes: number = 5
): BatchedNotification[] {
  const now = Date.now();
  const groups = new Map<string, any[]>();

  notifications.forEach(notification => {
    const notifTime = new Date(notification.createdAt).getTime();
    const timeWindow = Math.floor((now - notifTime) / (timeWindowMinutes * 60 * 1000));
    const groupKey = `window_${timeWindow}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(notification);
  });

  return Array.from(groups.entries()).map(([groupKey, notifs]) => ({
    groupKey,
    notifications: notifs,
    count: notifs.length,
  }));
}
