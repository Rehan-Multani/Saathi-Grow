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
        <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black p-0 pt-0 relative overflow-hidden transition-colors duration-300">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-0 p-4 bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-white md:bg-none dark:bg-none dark:bg-black md:dark:bg-black border-b border-gray-100 dark:border-white/5 md:border-none">
                    <button
                        onClick={() => {
                            const from = location.state?.from || '/';
                            const noMenuPages = ['/settings', '/profile'];
                            const shouldOpenMenu = !noMenuPages.includes(from);
                            navigate(from, { state: { openMenu: shouldOpenMenu } });
                        }}
                        className="p-1.5 md:p-2 bg-white/50 dark:bg-[#141414] rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={16} className="md:w-6 md:h-6" />
                    </button>
                    <h1 className="!text-[16px] md:!text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Security Center</h1>
                </div>

                {/* Password Section */}
                <div className="px-0 md:px-0 mb-6 md:mb-8 md:p-4">
                    <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 mb-2 px-6 md:px-2 tracking-widest uppercase">Password Management</h3>
                    <div className="flex flex-col gap-0 md:gap-3 bg-transparent md:bg-transparent">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full py-5 px-6 md:py-4 md:px-4 flex items-center justify-between bg-transparent md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl md:shadow-sm hover:md:shadow-md transition-all text-left group active:bg-gray-50/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 md:w-10 md:h-10 bg-orange-50 dark:bg-orange-500/10 rounded-full md:rounded-xl border border-orange-100/50 dark:border-white/10 flex items-center justify-center text-orange-500 shadow-sm md:shadow-none">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <h4 className="!text-[13px] md:!text-base font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none mb-1">Change password</h4>
                                    <p className="!text-[10px] md:!text-sm text-gray-400 font-medium">Last changed 3 months ago</p>
                                </div>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0c831f] transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Two Factor Auth */}
                <div className="px-0 md:px-0 mb-6 md:mb-8 md:p-4">
                    <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 mb-2 px-6 md:px-2 tracking-widest uppercase">Enhanced Protection</h3>
                    <div className="flex flex-col gap-0 md:gap-3 bg-transparent md:bg-transparent">
                        <div className="py-5 px-6 md:py-4 md:px-4 flex items-center justify-between bg-transparent md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl md:shadow-sm group">
                            <div className="flex items-center gap-4 text-left">
                                <div className={`w-10 h-10 rounded-full md:rounded-xl flex items-center justify-center border border-gray-100/50 dark:border-white/10 shadow-sm transition-colors ${twoFactor ? 'bg-green-50 text-[#0c831f]' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h4 className="!text-[13px] md:!text-base font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none mb-1">2FA security</h4>
                                    <p className="!text-[10px] md:!text-sm text-gray-400 font-medium">Secure your login with OTP</p>
                                </div>
                            </div>
                            <button
                                onClick={handleToggle2FA}
                                className={`w-10 h-6 md:w-9 md:h-5 rounded-full transition-all relative ${twoFactor ? 'bg-[#0c831f]' : 'bg-gray-200 dark:bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 md:w-3 md:h-3 bg-white rounded-full transition-all shadow-sm ${twoFactor ? 'left-[1.35rem] md:left-[1.35rem]' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logged in Devices */}
                <div className="px-0 md:px-0 mb-8 md:mb-8 md:p-4">
                    <h3 className="!text-[10px] md:!text-xs font-bold text-gray-400 mb-2 px-6 md:px-2 tracking-widest uppercase">Logged-in Devices</h3>
                    <div className="flex flex-col gap-0 md:gap-3 divide-y divide-gray-100 dark:divide-white/5 md:divide-none bg-transparent md:bg-transparent">
                        {devices.map((device, idx) => (
                            <div
                                key={idx}
                                className="py-5 px-6 md:py-4 md:px-4 flex items-center justify-between bg-transparent md:bg-white dark:md:bg-[#141414] md:border md:border-gray-100 dark:md:border-white/5 md:rounded-2xl md:shadow-sm hover:md:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-full md:rounded-xl border border-gray-100/50 dark:border-white/10 flex items-center justify-center text-gray-400 shadow-sm md:shadow-none">
                                        <device.icon size={18} />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="!text-[13px] md:!text-base font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none">{device.name}</h4>
                                            {device.active && (
                                                <span className="px-1.5 py-0.5 bg-green-100 dark:bg-[#0c831f]/20 text-[#0c831f] text-[8px] font-black uppercase rounded leading-none">Current</span>
                                            )}
                                        </div>
                                        <p className="!text-[10px] md:!text-sm text-gray-400 font-medium leading-none">{device.location}</p>
                                    </div>
                                </div>
                                <button className="!text-[9px] md:!text-[8.5px] font-black text-red-500 uppercase tracking-widest active:scale-95 px-3 py-1.5 md:px-2 md:py-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">Revoke</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="mx-6 p-4 bg-[#eefaf1] rounded-2xl border border-[#0c831f]/10 text-center mb-10 md:mb-0">
                    <p className="text-[10px] md:text-[11px] text-[#0c831f] font-bold leading-relaxed">SaathiGro will never ask for your password or OTP via call or email. Stay safe! 🛡️</p>
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
