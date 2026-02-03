import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const LoginPage = () => {
    const { login } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const navigate = useNavigate();

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
            navigate('/');
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

            <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="bg-green-50 dark:bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0c831f] dark:text-[#10b981]">
                            <User size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Login to continue shopping</p>
                    </div>

                    {!showOTP ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 dark:text-gray-400 font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength="10"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-12 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-[#0c831f] focus:border-[#0c831f] transition-colors bg-white dark:bg-gray-900 dark:text-white"
                                        placeholder="98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={phoneNumber.length !== 10}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0c831f] hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-lg shadow-green-500/20"
                            >
                                <Lock size={18} className="mr-2" />
                                Send OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter OTP</label>
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-center text-2xl tracking-widest focus:ring-[#0c831f] focus:border-[#0c831f] bg-white dark:bg-gray-900 dark:text-white"
                                    placeholder="• • • •"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={otp.length !== 4}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#0c831f] hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-lg shadow-green-500/20"
                            >
                                Verify & Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOTP(false)}
                                className="w-full text-center text-sm text-[#0c831f] dark:text-[#10b981] hover:underline font-semibold"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
                </div>
                <div className="bg-gray-50 dark:bg-black px-8 py-4 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-[#0c831f] dark:text-[#10b981] hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
