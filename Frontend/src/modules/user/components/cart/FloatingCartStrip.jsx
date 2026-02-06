import React from 'react';
import { useCart } from '../../context/CartContext';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FloatingCartStrip = () => {
    const { cartCount, cart, toggleCart, isCartOpen } = useCart();
    const routerLocation = useLocation();

    // Store the initial count when the component mounts to detect NEW additions
    const initialCount = React.useRef(cartCount);
    const [hasBeenTriggered, setHasBeenTriggered] = React.useState(false);

    React.useEffect(() => {
        // If current count is greater than what it was at start, user added something in this session
        if (cartCount > initialCount.current) {
            setHasBeenTriggered(true);
        }
    }, [cartCount]);

    // Hide if cart is empty, if sidebar is open, or on checkout/success pages
    const hiddenPages = ['/checkout', '/order-success', '/login', '/register'];
    if (cartCount === 0 || isCartOpen || hiddenPages.includes(routerLocation.pathname) || !hasBeenTriggered) return null;

    // Get unique product images (up to 2)
    const uniqueItems = Array.from(new Map(cart.map(item => [item.id, item])).values()).slice(-2);

    const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/679/679821.png"; // Placeholder package icon

    return (
        <div className="fixed bottom-28 md:bottom-10 left-1/2 -translate-x-1/2 z-[45] w-[95%] max-w-[165px] md:max-w-[220px] animate-in slide-in-from-bottom-10 duration-500">
            <button
                onClick={toggleCart}
                className="group relative flex w-full items-center justify-between bg-gradient-to-b from-[#0c9d23] to-[#09811c] p-2.5 md:p-3 text-white shadow-[0_12px_30px_rgba(12,131,31,0.4)] border border-white/25 transition-all active:scale-[0.96] overflow-hidden"
                style={{ borderRadius: '9999px' }}
            >
                {/* High-Gloss Top Reflection Overlay */}
                <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none z-10" />

                {/* Fixed Shine Animation Effect */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-20">
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] animate-[shine_4s_infinite]" />
                </div>

                <div className="flex items-center z-10">
                    {/* Stacked Item Images - Bigger and Clearer */}
                    <div className="flex items-center">
                        {uniqueItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full border-[2px] border-white bg-white shadow-sm transition-all duration-300 overflow-hidden"
                                style={{
                                    marginLeft: index === 0 ? '0' : '-20px',
                                    zIndex: (index + 1) * 10,
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="ml-3 flex flex-col items-start text-left">
                        <span className="text-[12px] md:text-[13px] font-black leading-tight tracking-tight">View cart</span>
                        <span className="text-[10px] md:text-[11px] font-medium text-white/90 leading-none mt-0.5">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center z-10">
                    <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white/20 border border-white/10 transition-all group-hover:bg-white/30 backdrop-blur-sm">
                        <ChevronRight size={14} strokeWidth={4} className="text-white" />
                    </div>
                </div>
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shine {
                    0% { left: -100%; opacity: 0; }
                    20% { opacity: 1; }
                    50% { left: 100%; opacity: 0; }
                    100% { left: 100%; opacity: 0; }
                }
            `}} />
        </div>
    );
};

export default FloatingCartStrip;
