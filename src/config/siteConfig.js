export const siteConfig = {
  brand: {
    name: 'Velvet Stream',
    shortName: 'VS',
    tagline: 'Premium video previews, updated daily.',
    domainHint: 'example.com',
    supportEmail: 'support@example.com',
    logoUrl: ''
  },

  admin: {
    // You can also override this with VITE_ADMIN_PATH in .env or hosting environment variables.
    defaultPath: '/admin'
  },

  firebase: {
    videosCollection: 'videos',
    settingsCollection: 'settings',
    publicSettingsDoc: 'public'
  },

  ui: {
    defaultCategory: 'All',
    categories: ['All', 'Trending', 'Latest', 'Popular', 'Featured'],
    itemsPerAdBreak: 8,
    showHomeHero: true,
    categoriesEnabled: true,
    showDemoDataWhenFirebaseEmpty: true
  },

  legal: {
    minimumAge: 18,
    showAgeGate: true,
    ageGateStorageKey: 'vs_age_verified_v1'
  },

  ads: {
    enabled: false,
    topBannerEnabled: true,
    inFeedBannerEnabled: true,
    watchPageBannerEnabled: true,
    nativeBannerEnabled: true,
    popunderEnabled: true,
    socialBarEnabled: true,
    topBannerHtml: '',
    inFeedBannerHtml: '',
    watchPageBannerHtml: '',
    nativeBannerHtml: '',
    popunderScriptUrl: '',
    socialBarScriptUrl: '',
    directButtons: [
      {
        label: 'Continue',
        url: 'https://example.com',
        enabled: false
      },
      {
        label: 'Open Full Video',
        url: 'https://example.com',
        enabled: false
      }
    ]
  }
};

export function getAdminPath() {
  const raw = import.meta.env.VITE_ADMIN_PATH || siteConfig.admin.defaultPath || '/admin';
  let path = String(raw).trim() || '/admin';
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, '');
  if (path === '') path = '/admin';
  if (['/watch', '/legal'].includes(path)) return '/admin';
  return path;
}
