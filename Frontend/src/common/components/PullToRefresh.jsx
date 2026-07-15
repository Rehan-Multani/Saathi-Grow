import React, { useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const PullToRefresh = ({ onRefresh, children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const controls = useAnimation();
    const y = useMotionValue(0);
    
    // Pixel-precise transforms for pull interactions
    const opacity = useTransform(y, [0, 60], [0, 1]);
    const scale = useTransform(y, [0, 100], [0.9, 1]);
    const rotateValue = useTransform(y, [0, 150], [0, 360]); 
    
    const contentY = useTransform(y, [0, 200], [0, 30]);

    const PULL_THRESHOLD = 90; 
    const MAX_PULL = 220;
    const PULL_START_SLOP = 12;
    
    const startY = useRef(0);
    const startX = useRef(0);
    const isPulling = useRef(false);
    const pullLocked = useRef(false);

    const resetPull = () => {
        isPulling.current = false;
        pullLocked.current = false;
        y.set(0);
    };

    const handleTouchStart = (e) => {
        // Only arm pull-to-refresh at the very top of the document
        if (window.scrollY <= 0 && !isRefreshing) {
            startY.current = e.touches[0].pageY;
            startX.current = e.touches[0].pageX;
            isPulling.current = true;
            pullLocked.current = false;
        } else {
            resetPull();
        }
    };

    const handleTouchMove = (e) => {
        if (!isPulling.current || isRefreshing) return;

        // If page already scrolled, never hijack touches
        if (window.scrollY > 0) {
            resetPull();
            return;
        }

        const touch = e.touches[0];
        const diffY = touch.pageY - startY.current;
        const diffX = Math.abs(touch.pageX - startX.current);

        // Horizontal / normal scroll down — release control so WebView can scroll
        if (!pullLocked.current) {
            if (diffY < -PULL_START_SLOP || (diffX > PULL_START_SLOP && diffX > Math.abs(diffY))) {
                resetPull();
                return;
            }
            if (diffY < PULL_START_SLOP) {
                return;
            }
            pullLocked.current = true;
        }

        if (diffY > 0 && pullLocked.current) {
            const dampedDiff = Math.min(diffY * 0.45, MAX_PULL);
            y.set(dampedDiff);
            if (e.cancelable) e.preventDefault();
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling.current || isRefreshing) {
            resetPull();
            return;
        }

        const currentY = y.get();
        const wasLocked = pullLocked.current;
        isPulling.current = false;
        pullLocked.current = false;

        if (wasLocked && currentY >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            await controls.start({
                y: 0, 
                transition: { type: "spring", stiffness: 400, damping: 30 }
            });

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                await controls.start({
                    y: 0,
                    transition: { type: "spring", stiffness: 300, damping: 35 }
                });
                y.set(0);
            }
        } else {
            await controls.start({
                y: 0,
                transition: { type: "spring", stiffness: 500, damping: 40 }
            });
            y.set(0);
        }
    };

    return (
        <div 
            className="relative w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={resetPull}
        >
            {/* SAATHIGRO Pixel-Perfect Brand Loader Overlay */}
            <motion.div
                style={{ 
                    opacity, 
                    scale,
                    top: 0
                }}
                animate={isRefreshing ? { opacity: 1, scale: 1 } : controls}
                className={`fixed inset-0 z-[9999] pointer-events-none flex flex-col items-center justify-center bg-white ${!isRefreshing && y.get() < 5 ? 'hidden' : 'flex'}`}
            >
                <div className="flex flex-col items-center gap-10">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <motion.svg 
                            viewBox="0 0 100 100" 
                            className="w-full h-full"
                            style={{ rotate: isRefreshing ? 0 : rotateValue }}
                            animate={isRefreshing ? { rotate: 360 } : {}}
                            transition={isRefreshing ? {
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear"
                            } : { duration: 0 }}
                        >
                            <g transform="rotate(-90 50 50)">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    stroke="#1a1c24" 
                                    strokeWidth="4.5"
                                    fill="transparent"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="44"
                                    stroke="#CCFF00"
                                    strokeWidth="4.5"
                                    fill="transparent"
                                    strokeLinecap="butt"
                                    strokeDasharray="276.46" 
                                    strokeDashoffset={276.46 * 0.72}
                                />
                            </g>
                        </motion.svg>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <motion.span 
                            className="text-[18px] font-black tracking-[0.45em] text-[#CCFF00] uppercase"
                        >
                            SAATHIGRO
                        </motion.span>
                        <div className="w-24 h-[4.5px] bg-[#f2f4f7] mt-5 rounded-full overflow-hidden relative">
                            {isRefreshing && (
                                <motion.div 
                                    className="absolute inset-0 bg-[#CCFF00]"
                                    animate={{ x: [-96, 96] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                />
                            )}
                            {!isRefreshing && y.get() > 0 && (
                                <div 
                                    className="absolute inset-0 bg-[#CCFF00] origin-left"
                                    style={{ transform: `scaleX(${Math.min(y.get() / PULL_THRESHOLD, 1)})` }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div 
                style={{ y: isRefreshing ? 0 : contentY }}
                className="w-full"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PullToRefresh;
