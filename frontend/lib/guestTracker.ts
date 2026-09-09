const GUEST_DEVICE_ID_KEY = 'memento_guest_device_id';

// Generate a unique device identifier
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const navigatorHash = typeof navigator !== 'undefined'
    ? btoa(navigator.userAgent.slice(0, 50)).slice(0, 8)
    : 'ssr';
  return `mg_${timestamp}_${randomPart}_${navigatorHash}`;
}

// Get or create a persistent guest device ID
export function getGuestDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder';
  
  let deviceId = localStorage.getItem(GUEST_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(GUEST_DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// Reset device ID (for testing)
export function resetGuestDeviceId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_DEVICE_ID_KEY);
}
