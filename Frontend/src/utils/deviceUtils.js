export const isWebView = () => {
  return window.navigator.userAgent.includes('Flutter') ||
    window.navigator.userAgent.includes('saathigroApp');
};

export const getEnvironment = () => {
  return isWebView() ? 'apk' : 'web';
};
