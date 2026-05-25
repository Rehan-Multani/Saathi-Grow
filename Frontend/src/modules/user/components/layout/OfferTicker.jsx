import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Flame, Clock, Zap } from 'lucide-react';

const CountdownTimer = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = new Date(expiryDate).getTime() - now;

            if (distance < 0) {
                setTimeLeft("00:00:00");
                clearInterval(timer);
            } else {
                const hours = Math.floor(distance / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/5 ml-1 md:ml-2">
            <Clock size={11} className="text-white/80" />
            <span className="font-mono font-bold text-[9px] md:text-[12px]">{timeLeft}</span>
        </div>
    );
};

const OfferTicker = () => {
    const { offers, loading } = useShop();

    const renderTickerItems = useMemo(() => {
        if (loading || !offers || offers.length === 0) return null;

        const singleTicker = offers.map(offer => {
            const isFlash = offer.discountPercentage >= 40 || offer.title.toLowerCase().includes('flash');
            const hasCountdown = offer.expiryDate && new Date(offer.expiryDate) > new Date();

            return (
                <div key={offer._id} className="flex items-center gap-2 md:gap-4 mx-6 md:mx-10 whitespace-nowrap">
                    {/* Icon Part */}
                    {isFlash ? (
                        <Zap size={13} className="text-yellow-300 fill-yellow-300 animate-pulse hidden sm:block" />
                    ) : (
                        <Flame size={13} className="text-orange-400 fill-orange-400 hidden sm:block" />
                    )}

                    {/* Main Content */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="font-extrabold text-[10px] md:text-[13px] tracking-tight">
                            {offer.title.toUpperCase()}
                        </span>
                        {offer.discountPercentage > 0 && (
                            <span className="bg-white/20 px-1.5 py-0.5 rounded-sm font-black text-[9px] md:text-[11px] border border-white/10">
                                {offer.discountPercentage}% OFF
                            </span>
                        )}
                        <span className="opacity-80 font-medium text-[9px] md:text-[12px] lowercase tracking-wide">
                            {offer.subtitle}
                        </span>
                    </div>

                    {/* Countdown Detail */}
                    {hasCountdown && (
                        <CountdownTimer expiryDate={offer.expiryDate} />
                    )}
                </div>
            );
        });

        // Duplicate for seamless scroll
        return (
            <div className="flex animate-marquee py-1 md:py-1.5">
                {[...Array(6)].map((_, i) => (
                    <React.Fragment key={i}>
                        {singleTicker}
                    </React.Fragment>
                ))}
            </div>
        );
    }, [offers, loading]);

    if (!renderTickerItems) return null;

    return (
        <div className="relative z-[110] overflow-hidden bg-gradient-to-r from-[#0c831f] via-[#0e9624] to-[#0c831f] text-white border-b border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-fast" />
            
            <div 
                className="relative z-20"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                }}
            >
                {renderTickerItems}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes shimmer-fast {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer-fast {
                    animation: shimmer-fast 4s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default OfferTicker;
