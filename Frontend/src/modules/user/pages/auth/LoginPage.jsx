import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const LoginPage = () => {
    const { login, user } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path from query string
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';

    // Robust Redirection: Watch for user change
    React.useEffect(() => {
        if (user) {
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate, redirectPath]);

    const handleSendOTP = (e) => {
        e.preventDefault();
        if (phoneNumber.length === 10) {
            setShowOTP(true);
        } else {
            alert('Please enter a valid 10-digit number');
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (otp === '1234') {
            login(phoneNumber);
            navigate(redirectPath, { replace: true });
        } else {
            alert('Invalid OTP. Use 1234');
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            ></div>
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            <div className="bg-white dark:bg-black rounded-xl shadow-xl w-full max-w-[340px] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="bg-green-50 dark:bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-[#0c831f] dark:text-[#10b981]">
                            <User size={24} />
                        </div>
                        <h1 className="!text-base font-black text-gray-900 dark:text-white tracking-tight">Welcome Back</h1>
                        <p className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 font-medium">Login to continue shopping</p>
                    </div>

                    {!showOTP ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 dark:text-gray-500 font-black text-xs">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength="10"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-11 pr-3 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-1 focus:ring-[#0c831f] focus:border-[#0c831f] outline-none transition-all bg-gray-50/50 dark:bg-white/5 dark:text-white text-xs font-bold"
                                        placeholder="98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={phoneNumber.length !== 10}
                                style={{ borderRadius: '100px' }}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-xs font-black text-white bg-[#0c831f] hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]"
                            >
                                <Lock size={14} className="mr-2" />
                                Send OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1">Enter OTP</label>
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full px-3 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl text-center text-xl tracking-[0.5em] focus:ring-1 focus:ring-[#0c831f] focus:border-[#0c831f] outline-none bg-gray-50/50 dark:bg-white/5 dark:text-white font-black"
                                    placeholder="••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={otp.length !== 4}
                                style={{ borderRadius: '100px' }}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-xs font-black text-white bg-[#0c831f] hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]"
                            >
                                Verify & Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOTP(false)}
                                className="w-full text-center text-[10px] text-[#0c831f] dark:text-[#10b981] hover:underline font-bold uppercase tracking-wider"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
                <div className="bg-gray-50/50 dark:bg-white/5 px-6 py-3.5 text-center border-t border-gray-100 dark:border-white/5">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        Don't have an account?{' '}
                        <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="font-bold text-[#0c831f] dark:text-[#10b981] hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
