import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles } from 'lucide-react';

// Premium Particle Burst Component
const CelebrationBurst = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(40)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm animate-fall-premium"
                    style={{
                        backgroundColor: ['#0c831f', '#FFD700', '#FF6B6B', '#4D96FF', '#A78BFA'][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `-10px`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 3}s`
                    }}
                />
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                {[...Array(24)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-6 rounded-full animate-burst"
                        style={{
                            backgroundColor: ['#0c831f', '#FFD700', '#FF6B6B'][i % 3],
                            transform: `rotate(${i * 15}deg) translateY(-80px)`,
                            opacity: 0,
                            animationDelay: '0.2s',
                            animationDuration: '1s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const OrderSuccessPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-transparent dark:bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-colors duration-700 pt-20">
            <CelebrationBurst />
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <div className="relative mb-10 flex flex-col items-center">
                    {/* Enhanced Success Icon like the reference */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                        <div className="w-24 h-24 bg-[#0c831f] rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(12,131,31,0.3)] relative z-10 animate-checkmark-pop">
                            <div className="absolute inset-2 border-[3px] border-white/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-lg animate-bounce">
                                <Sparkles size={16} className="text-white fill-white" />
                            </div>
                            <CheckCircle size={52} strokeWidth={2.5} className="drop-shadow-lg" />
                        </div>
                    </div>
                </div>
                <div className="space-y-4 mb-12 flex flex-col items-center">
                    <h1 className="text-[26px] font-black text-gray-900 dark:text-white leading-none tracking-tight">Order Success!</h1>
                    <p className="text-[13px] text-gray-500 font-semibold px-4 max-w-[240px] leading-relaxed">
                        Freshness is on the way! Your order has been placed successfully.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    style={{ borderRadius: '100px' }}
                    className="w-[85%] max-w-[240px] bg-[#0c831f] text-white py-4 font-black text-[13px] uppercase tracking-widest shadow-[0_15px_35px_rgba(12,131,31,0.25)] active:scale-95 transition-all"
                >
                    Back to Home
                </button>
            </div>
            <style>{`
                @keyframes fall-premium { 0% { transform: translateY(-50px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(110vh) rotate(540deg); opacity: 0; } }
                .animate-fall-premium { animation: fall-premium linear forwards; }
                @keyframes burst { 0% { transform: rotate(var(--tw-rotate)) translateY(0px) scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: rotate(var(--tw-rotate)) translateY(-150px) scale(1.5); opacity: 0; } }
                .animate-burst { animation: burst 1s ease-out forwards; }
                @keyframes checkmark-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
                .animate-checkmark-pop { animation: checkmark-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
};

export default OrderSuccessPage;
