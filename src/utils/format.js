import { siteConfig } from '../config/siteConfig';

export function toMillis(value) {
  if (!value) return Date.now();
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  if (value.seconds) return value.seconds * 1000;
  if (typeof value.toMillis === 'function') return value.toMillis();
  return Date.now();
}

export function normalizeVideo(raw, fallbackId = '') {
  const data = raw || {};

  return {
    id: String(
      data.id ||
        fallbackId ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `video-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    ),
    title: data.title || 'Untitled video',
    thumbnail: data.thumbnail || data.thumbnailUrl || '',
    views: data.views || '0',
    duration: data.duration || '00:00',
    category: data.category || 'Latest',
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === 'string'
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
    embedUrl: data.embedUrl || data.embedURL || data.videoEmbed || '',
    directLink: data.directLink || data.buttonUrl || '',
    status: data.status || 'active',
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt)
  };
}

export function normalizeSettings(raw = {}) {
  const defaultSettings = siteConfig;

  return {
    brand: {
      ...defaultSettings.brand,
      ...(raw.brand || {})
    },
    ui: {
      ...defaultSettings.ui,
      ...(raw.ui || {}),
      categories: Array.isArray(raw.ui?.categories) && raw.ui.categories.length
        ? raw.ui.categories
        : defaultSettings.ui.categories
    },
    legal: {
      ...defaultSettings.legal,
      ...(raw.legal || {})
    },
    ads: {
      ...defaultSettings.ads,
      ...(raw.ads || {}),
      directButtons: Array.isArray(raw.ads?.directButtons)
        ? raw.ads.directButtons
        : defaultSettings.ads.directButtons
    }
  };
}

export function serializeSettings(settings) {
  return {
    brand: settings.brand,
    ui: settings.ui,
    legal: settings.legal,
    ads: settings.ads,
    updatedAt: Date.now()
  };
}

export function buildGradientFromText(text = '') {
  const gradients = [
    'from-rose-500 via-fuchsia-500 to-indigo-500',
    'from-orange-500 via-rose-500 to-pink-600',
    'from-violet-500 via-purple-500 to-fuchsia-500',
    'from-cyan-500 via-blue-500 to-violet-600',
    'from-amber-500 via-red-500 to-pink-600',
    'from-emerald-500 via-teal-500 to-cyan-600'
  ];

  const sum = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[sum % gradients.length];
}

export function safeExternalOpen(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(', ') : '';
}

export function stringToTags(value) {
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function sortNewestFirst(items) {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}
