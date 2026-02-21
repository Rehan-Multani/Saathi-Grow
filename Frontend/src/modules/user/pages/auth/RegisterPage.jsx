import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, RefreshCw, Loader2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/userAuthApi';
import { toast } from 'react-toastify';

const RegisterPage = () => {
    const { register, user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate, redirectPath]);

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) {
            return toast.error('Enter a valid 10-digit phone number');
        }
        if (!formData.name) {
            return toast.error('Please enter your name');
        }

        setLoading(true);
        try {
            await authApi.requestOTP(formData.phone, 'register');
            setShowOTP(true);
            setResendTimer(60);
            toast.success('OTP sent successfully');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyRegister = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return toast.error('Enter 6-digit OTP');
        }

        const result = await register({
            phone: formData.phone,
            otp,
            name: formData.name,
            email: formData.email || undefined
        });

        if (result.success) {
            navigate(redirectPath, { replace: true });
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            await authApi.resendOTP(formData.phone);
            setResendTimer(60);
            toast.success('OTP resent successfully');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen md:min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            <div className="bg-white dark:bg-black rounded-xl shadow-xl w-full max-w-[340px] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h1>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium font-bold uppercase tracking-wider">Join sathiGro Family</p>
                    </div>

                    {!showOTP ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1 uppercase">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <User size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all dark:text-white text-[13px] font-bold"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1 uppercase">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Phone size={14} />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        maxLength="10"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                        placeholder="98765 43210"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all dark:text-white text-[13px] font-bold"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1 uppercase">Email (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={14} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all dark:text-white text-[13px] font-bold"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={formData.phone.length !== 10 || !formData.name || loading}
                                style={{ borderRadius: '16px' }}
                                className="w-full bg-[#0c831f] text-white py-2.5 font-black text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 size={14} className="animate-spin" />}
                                Register Account
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyRegister} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1">Enter OTP sent to {formData.phone}</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full px-3 py-2.5 border border-gray-100 dark:border-gray-800 rounded-xl text-center text-xl tracking-[0.2em] focus:ring-1 focus:ring-[#0c831f] focus:border-[#0c831f] outline-none bg-gray-50/50 dark:bg-white/5 dark:text-white font-black"
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={otp.length !== 6 || loading}
                                style={{ borderRadius: '16px' }}
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent shadow-sm text-xs font-black text-white bg-[#0c831f] hover:bg-[#0a6b19] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                Verify & Create Account
                            </button>

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendTimer > 0 || loading}
                                    className="text-center text-[10px] text-[#0c831f] dark:text-[#10b981] hover:underline font-bold uppercase tracking-wider disabled:opacity-50 disabled:no-underline"
                                >
                                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowOTP(false)}
                                    className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider hover:text-gray-600"
                                >
                                    Back to Register
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-[#0c831f] dark:text-[#10b981] font-bold hover:underline">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

