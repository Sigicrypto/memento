export type DemoMediaType = 'image' | 'video';

export interface DemoMedia {
  id: string;
  url: string;
  type: DemoMediaType;
  caption: string;
  uploader: string;
  createdAt: number;
}

export const DEMO_ID_KEY = 'memento_demo_id';
const DEMO_PHOTOS_PREFIX = 'memento_demo_photos_';
const DEMO_EXPIRY_PREFIX = 'memento_demo_expires_at_';
export const DEMO_DURATION_MS = 5 * 60 * 1000;

function isBrowser() {
  return typeof window !== 'undefined';
}

export function generateDemoId() {
  return `${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 5)}`;
}

export function getDemoPhotosKey(demoId: string) {
  return `${DEMO_PHOTOS_PREFIX}${demoId}`;
}

export function getDemoExpiryKey(demoId: string) {
  return `${DEMO_EXPIRY_PREFIX}${demoId}`;
}

export function getOrCreateDemoId(preferredId?: string | null) {
  if (!isBrowser()) return preferredId || generateDemoId();

  const existing = window.localStorage.getItem(DEMO_ID_KEY);
  const demoId = preferredId || existing || generateDemoId();
  window.localStorage.setItem(DEMO_ID_KEY, demoId);
  return demoId;
}

export function readDemoPhotos(demoId: string): DemoMedia[] {
  if (!isBrowser() || !demoId) return [];

  const raw = window.localStorage.getItem(getDemoPhotosKey(demoId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as DemoMedia[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => Boolean(item?.id && item?.url && item?.type))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function writeDemoPhotos(demoId: string, photos: DemoMedia[]) {
  if (!isBrowser() || !demoId) return;
  window.localStorage.setItem(getDemoPhotosKey(demoId), JSON.stringify(photos));
}

export function upsertDemoPhoto(demoId: string, photo: DemoMedia) {
  const existing = readDemoPhotos(demoId);
  const next = [photo, ...existing.filter((item) => item.id !== photo.id && item.url !== photo.url)];
  writeDemoPhotos(demoId, next);
  return next;
}

export function getOrCreateDemoExpiry(demoId: string) {
  if (!isBrowser() || !demoId) return Date.now() + DEMO_DURATION_MS;

  const raw = window.localStorage.getItem(getDemoExpiryKey(demoId));
  const existing = raw ? Number(raw) : NaN;
  if (Number.isFinite(existing) && existing > Date.now()) {
    return existing;
  }

  const next = Date.now() + DEMO_DURATION_MS;
  window.localStorage.setItem(getDemoExpiryKey(demoId), String(next));
  return next;
}

export function getDemoTimeLeft(demoId: string) {
  return Math.max(0, getOrCreateDemoExpiry(demoId) - Date.now());
}

export function clearDemoData(demoId: string) {
  if (!isBrowser()) return;

  window.localStorage.removeItem(DEMO_ID_KEY);
  if (!demoId) return;
  window.localStorage.removeItem(getDemoPhotosKey(demoId));
  window.localStorage.removeItem(getDemoExpiryKey(demoId));
}
