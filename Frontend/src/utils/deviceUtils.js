export const isWebView = () => {
  return window.navigator.userAgent.includes('Flutter') ||
    window.navigator.userAgent.includes('SathiGroApp');
};

export const getEnvironment = () => {
  return isWebView() ? 'apk' : 'web';
};
