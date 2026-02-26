let loadingPromise = null;

export const loadGoogleMaps = () => {
  if (window.google) {
    return Promise.resolve(window.google);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists in DOM (e.g. from another component)
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (window.google) {
        resolve(window.google);
      } else {
        existingScript.onload = () => resolve(window.google);
        existingScript.onerror = (e) => reject(e);
      }
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Using the modern loading pattern suggested by Google
    // Note: We use the direct URL but ensure it's only appended once
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback&loading=async`;
    script.async = true;
    script.defer = true;

    window.initGoogleMapsCallback = () => {
      resolve(window.google);
    };

    script.onerror = (e) => {
      reject(e);
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};
