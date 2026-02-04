import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, Smartphone, Monitor, ChevronRight, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SecurityPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [twoFactor, setTwoFactor] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const devices = [
        { name: "iPhone 15 Pro", location: "Delhi, India", active: true, icon: Smartphone },
        { name: "MacBook Pro M2", location: "Bangalore, India", active: false, icon: Monitor }
    ];

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const handleToggle2FA = () => {
        const newState = !twoFactor;
        setTwoFactor(newState);
        triggerToast(newState ? "Two-Factor Authentication Enabled!" : "Two-Factor Authentication Disabled");
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setShowPasswordModal(false);
        triggerToast("Password changed successfully!");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 pt-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 bg-white dark:bg-[#141414] rounded-full shadow-sm"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="!text-[13px] font-black text-gray-900 dark:text-gray-100 tracking-tight">Security Center</h1>
                </div>

                {/* Password Section */}
                <div className="mb-6">
                    <h3 className="!text-[8px] font-bold text-gray-400 mb-2 px-1 tracking-widest leading-none">Password Management</h3>
                    <div className="bg-white dark:bg-[#141414] rounded-[24px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full p-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                                    <Key size={16} />
                                </div>
                                <div>
                                    <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 tracking-tight">Change password</h4>
                                    <p className="!text-[8.5px] text-gray-400 font-medium">Last changed 3 months ago</p>
                                </div>
                            </div>
                            <ChevronRight size={14} className="text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Two Factor Auth */}
                <div className="mb-6">
                    <h3 className="!text-[8px] font-bold text-gray-400 mb-2 px-1 tracking-widest leading-none">Enhanced Protection</h3>
                    <div className="bg-white dark:bg-[#141414] rounded-[20px] border border-gray-100 dark:border-white/5 p-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-left">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${twoFactor ? 'bg-green-50 text-[#0c831f]' : 'bg-gray-50 text-gray-400'}`}>
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 tracking-tight">2FA security</h4>
                                    <p className="!text-[8.5px] text-gray-400 font-medium">Secure your login with OTP</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle2FA}
                                className={`w-12 h-6 rounded-full transition-all relative ${twoFactor ? 'bg-[#0c831f]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${twoFactor ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logged in Devices */}
                <div className="mb-6">
                    <h3 className="!text-[8px] font-bold text-gray-400 mb-2 px-1 tracking-widest leading-none">Logged-in Devices</h3>
                    <div className="bg-white dark:bg-[#141414] rounded-[20px] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        {devices.map((device, idx) => (
                            <div
                                key={idx}
                                className={`p-4 flex items-center justify-between ${idx !== devices.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-8 h-8 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-400">
                                        <device.icon size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100 tracking-tight">{device.name}</h4>
                                            {device.active && (
                                                <span className="px-1.5 py-0.5 bg-green-100 text-[#0c831f] text-[7px] font-black uppercase rounded leading-none">Current</span>
                                            )}
                                        </div>
                                        <p className="!text-[8.5px] text-gray-400 font-medium">{device.location}</p>
                                    </div>
                                </div>
                                <button className="!text-[8.5px] font-black text-red-500 uppercase tracking-tight active:scale-95">Revoke</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed text-center">SaathiGro will never ask for your password or OTP via call or email. Stay safe! 🛡️</p>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative bg-white dark:bg-[#141414] w-full max-w-[320px] rounded-[24px] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">Change Password</h2>
                            <button onClick={() => setShowPasswordModal(false)} className="p-1.5 bg-gray-50 dark:bg-white/5 rounded-full shadow-sm"><X size={16} /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                                <label className="!text-[8.5px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Old Password</label>
                                <input type="password" required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-xs font-bold focus:outline-none focus:border-[#0c831f] transition-all" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="!text-[8.5px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">New Password</label>
                                <input type="password" required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-xs font-bold focus:outline-none focus:border-[#0c831f] transition-all" placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full bg-[#0c831f] text-white py-3 rounded-xl font-black !text-[11px] shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all mt-4 uppercase tracking-widest">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-bottom duration-300">
                    <div className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
                        <CheckCircle size={18} className="text-[#0c831f]" />
                        <span className="text-sm font-black whitespace-nowrap">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;
