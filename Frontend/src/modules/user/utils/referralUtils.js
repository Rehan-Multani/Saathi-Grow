const REFERRAL_STORAGE_KEY = 'saathigro_referral_code';

/**
 * Persist referral code from URL (?ref=) so it survives until registration.
 */
export const captureReferralFromUrl = (search = window.location.search) => {
  try {
    const params = new URLSearchParams(search);
    const ref = (params.get('ref') || '').trim().toUpperCase();
    if (ref) {
      localStorage.setItem(REFERRAL_STORAGE_KEY, ref);
    }
  } catch {
    // ignore storage errors
  }
};

export const getStoredReferralCode = () => {
  try {
    return localStorage.getItem(REFERRAL_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const clearStoredReferralCode = () => {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Web invite link: https://host/register?ref=CODE
 */
export const buildReferralShareLink = (referralCode) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/register?ref=${encodeURIComponent(referralCode)}`;
};

const getConfiguredStoreUrls = (settings = {}) => ({
  playStoreUrl:
    settings.playStoreUrl ||
    import.meta.env.VITE_PLAY_STORE_URL ||
    '',
  appStoreUrl:
    settings.appStoreUrl ||
    import.meta.env.VITE_APP_STORE_URL ||
    ''
});

/**
 * Attach referral code to store URLs (Play Install Referrer / App Store campaign token).
 */
export const withReferralOnStoreUrl = (storeUrl, referralCode, platform = 'android') => {
  if (!storeUrl || !referralCode) return storeUrl || '';
  try {
    const url = new URL(storeUrl);
    if (platform === 'android') {
      const referrerValue = `utm_source=saathigro_invite&utm_content=${referralCode}`;
      url.searchParams.set('referrer', referrerValue);
    } else {
      url.searchParams.set('ct', referralCode);
    }
    return url.toString();
  } catch {
    return storeUrl;
  }
};

/**
 * Full share payload: referral code + Play Store + App Store + web link.
 */
export const buildReferralSharePayload = (referralCode, settings = {}) => {
  const webLink = buildReferralShareLink(referralCode);
  const { playStoreUrl, appStoreUrl } = getConfiguredStoreUrls(settings);
  const playStoreLink = withReferralOnStoreUrl(playStoreUrl, referralCode, 'android');
  const appStoreLink = withReferralOnStoreUrl(appStoreUrl, referralCode, 'ios');

  const lines = [
    'Join me on Saathigro for fresh groceries!',
    '',
    `Referral code: ${referralCode}`,
    '',
    'Download the app:'
  ];

  if (playStoreLink) {
    lines.push(`Android (Play Store): ${playStoreLink}`);
  }
  if (appStoreLink) {
    lines.push(`iOS (App Store): ${appStoreLink}`);
  }
  if (!playStoreLink && !appStoreLink) {
    lines.push('(App store links will appear once configured by admin)');
  }

  lines.push('', `Or open on web: ${webLink}`);

  return {
    referralCode,
    webLink,
    playStoreLink,
    appStoreLink,
    shareText: lines.join('\n')
  };
};
