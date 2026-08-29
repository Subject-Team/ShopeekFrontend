/**
 * Device fingerprint helpers.
 *
 * A stable `device_id` is generated once and persisted so every login from the
 * same browser/device reuses it — the backend replaces the old session row for
 * that device instead of stacking duplicates (multiple sessions across devices).
 */

const DEVICE_ID_KEY = 'shopeek_device_id';

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateUuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

const detectBrowser = (ua: string): string => {
  if (/edg/i.test(ua)) return 'Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  if (/micromessenger/i.test(ua)) return 'WeChat';
  return 'مرورگر';
};

const detectOs = (ua: string): string => {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'دستگاه';
};

/** Returns a short Persian-friendly device description like "Chrome / Windows". */
export const getDeviceLabel = (): string => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const browser = detectBrowser(ua);
  const os = detectOs(ua);
  return `${browser} / ${os}`;
};
