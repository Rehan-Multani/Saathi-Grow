import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 80], [0, 1]);
  const rotate = useTransform(y, [0, 100], [0, 360]);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 150;

  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].pageY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Add some resistance to the pull
      const dampedDiff = Math.min(diff * 0.4, MAX_PULL);
      y.set(dampedDiff);
      setPullDistance(dampedDiff);

      // Prevent default scrolling when pulling down at the top
      if (e.cancelable) e.preventDefault();
    } else {
      isPulling.current = false;
      y.set(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (y.get() >= PULL_THRESHOLD) {
      setIsRefreshing(true);

      // Haptic feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }

      // Lock at threshold
      await controls.start({
        y: PULL_THRESHOLD - 20,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      });

      try {
        await onRefresh();
      } catch (err) {
        console.error("Refresh action failed:", err);
      } finally {
        // Reset everything
        setIsRefreshing(false);
        await controls.start({
          y: 0,
          opacity: 0,
          transition: { duration: 0.3 }
        });
        y.set(0);
        setPullDistance(0);
      }
    } else {
      await controls.start({ y: 0, opacity: 0 });
      y.set(0);
      setPullDistance(0);
    }
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator - Overlay style to prevent white gaps in content */}
      <motion.div
        className="absolute top-4 left-0 right-0 flex justify-center z-[9999] pointer-events-none"
        style={{ y: isRefreshing ? undefined : y, opacity }}
        animate={controls}
        initial={{ y: 0, opacity: 0 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: rotate.get() }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
          >
            <RefreshCw
              size={20}
              className={`${(isRefreshing || y.get() >= PULL_THRESHOLD) ? 'text-[var(--saathi-green)]' : 'text-gray-400'} transition-colors`}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content Wrapper - No longer moving 'y' to prevent white gaps and layout shifts */}
      <div className="w-full h-full overscroll-none">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
