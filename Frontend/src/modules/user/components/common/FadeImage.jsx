import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ASSET_URLS } from '../../../../constants/assetUrls';

const PLACEHOLDER = ASSET_URLS.placeholder;

/**
 * Soft placeholder + slow crossfade so product images ease in (no sudden pop).
 */
const FadeImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  placeholder = PLACEHOLDER,
  loading = 'lazy',
  objectFitFallback = 'cover',
  onLoad,
  onError,
  ...imgProps
}) => {
  const resolvedSrc = src || placeholder;
  const imgRef = useRef(null);
  const revealTimerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [usedFallback, setUsedFallback] = useState(!src);

  const markLoaded = useCallback(() => {
    setLoaded(true);
    // Keep placeholder under the image until fade finishes so it crossfades, not snaps.
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => setShowPlaceholder(false), 750);
  }, []);

  useEffect(() => {
    const next = src || placeholder;
    setCurrentSrc(next);
    setUsedFallback(!src);
    setLoaded(false);
    setShowPlaceholder(true);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
  }, [src, placeholder]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      // Defer so the first paint is opacity-0, then the transition can run.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => markLoaded());
      });
    }
  }, [currentSrc, markLoaded]);

  useEffect(() => () => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
  }, []);

  const handleLoad = (e) => {
    markLoaded();
    onLoad?.(e);
  };

  const handleError = (e) => {
    if (currentSrc !== placeholder) {
      setCurrentSrc(placeholder);
      setUsedFallback(true);
      setLoaded(false);
      setShowPlaceholder(true);
      e.target.style.objectFit = objectFitFallback;
    } else {
      markLoaded();
    }
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showPlaceholder && (
        <div
          className={`absolute inset-0 z-0 bg-gray-100 dark:bg-zinc-800 transition-opacity duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden
        />
      )}
      <img
        ref={imgRef}
        {...imgProps}
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={[
          imgClassName,
          'relative z-[1] transition-opacity duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          loaded ? 'opacity-100' : 'opacity-0',
          usedFallback ? 'object-cover' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
};

export default FadeImage;
