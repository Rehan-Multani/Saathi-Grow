import React, { useState } from 'react';
import { X, User, Lock, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
    const { showLoginModal, closeLoginModal, login, loginView, setLoginView } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [name, setName] = useState(''); // For register

    if (!showLoginModal) return null;

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
        // Mock verification
        if (otp === '1234') {
            login(phoneNumber);
            // Reset state
            setPhoneNumber('');
            setOtp('');
            setShowOTP(false);
        } else {
            alert('Invalid OTP. Try 1234');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-xl transition-opacity"
                onClick={closeLoginModal}
            ></div>

            {/* Modal Card */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={closeLoginModal}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-20"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-6">
                        <div className="bg-[var(--saathi-green)]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--saathi-green)]">
                            <User size={30} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {loginView === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loginView === 'login' ? 'Login to access your orders' : 'Sign up to start shopping'}
                        </p>
                    </div>

                    {!showOTP ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            {loginView === 'register' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={16} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[var(--saathi-green)] focus:border-[var(--saathi-green)] transition-colors bg-gray-50"
                                            placeholder="Your Name"
                                            required={loginView === 'register'}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold text-sm">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="block w-full pl-12 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[var(--saathi-green)] focus:border-[var(--saathi-green)] transition-colors bg-gray-50"
                                        placeholder="98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-200 text-sm font-bold text-white bg-[var(--saathi-green)] hover:bg-green-700 transition-all"
                            >
                                <ArrowRight size={18} className="mr-2" />
                                Send OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="block w-full px-3 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:ring-[var(--saathi-green)] focus:border-[var(--saathi-green)] bg-gray-50"
                                    placeholder="• • • •"
                                    required
                                />
                                <div className="text-right mt-1">
                                    <button type="button" onClick={() => setShowOTP(false)} className="text-xs text-[var(--saathi-green)] font-medium hover:underline">Change Number?</button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-green-200 text-sm font-bold text-white bg-[var(--saathi-green)] hover:bg-green-700 transition-all"
                            >
                                Verify & Proceed
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        {loginView === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setLoginView(loginView === 'login' ? 'register' : 'login');
                                setShowOTP(false);
                            }}
                            className="font-bold text-[var(--saathi-green)] hover:text-green-700 underline"
                        >
                            {loginView === 'login' ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
