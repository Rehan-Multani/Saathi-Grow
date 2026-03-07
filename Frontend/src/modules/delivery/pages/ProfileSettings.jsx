import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User,
    Camera,
    Truck,
    CreditCard,
    Bell,
    Shield,
    History,
    HelpCircle,
    LogOut,
    ChevronRight,
    MapPin,
    Smartphone,
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    FileText,
    Lock,
    Globe,
    CheckCircle2
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { toast } from 'react-toastify';
import { updateDeliveryProfile } from '../api/deliveryAuthApi';

const ProfileSettings = () => {
    const { profile, logout, token, fetchProfile } = useDeliveryStore();
    const [notifications, setNotifications] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedView, setSelectedView] = useState('menu');
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
        navigate('/delivery/login');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            await updateDeliveryProfile(token, formData);
            await fetchProfile();
            toast.success('Profile picture updated!');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const menuItems = [
        { id: 'personal', icon: <User size={18} />, label: 'Personal information', sub: `${profile?.name || 'N/A'}, ${profile?.email || 'No email'}`, color: 'text-[#028A0F]' },
        { id: 'vehicle', icon: <Truck size={18} />, label: 'Vehicle details', sub: `${profile?.vehicleType || 'N/A'} - ${profile?.vehicleNumber || 'Pending'}`, color: 'text-orange-500' },
        { id: 'bank', icon: <CreditCard size={18} />, label: 'Bank details', sub: profile?.bankDetails?.bankName ? `${profile.bankDetails.bankName} - **** ${profile.bankDetails.accountNumber?.slice(-4)}` : 'Bank details not added', color: 'text-emerald-500' },
        { id: 'history', icon: <History size={18} />, label: 'Order history', sub: 'View completed missions', color: 'text-blue-500', isLink: true, path: '/delivery/history' },
        { id: 'legal', icon: <Shield size={18} />, label: 'Legal & Compliance', sub: 'T&C, Privacy Policy', color: 'text-zinc-500', isLink: true, path: '/delivery/legal' },
        { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications', sub: 'Manage alerts & sounds', color: 'text-purple-500', toggle: true },
        { id: 'security', icon: <Shield size={18} />, label: 'Security & privacy', sub: 'Authentication & access', color: 'text-red-500' },
        { id: 'help', icon: <HelpCircle size={18} />, label: 'Help & support', sub: 'FAQs, Contact us', color: 'text-slate-500' },
    ];

    const renderSubView = () => {
        const views = {
            personal: (
                <div className="space-y-1">
                    {[
                        { label: 'Full name', value: profile?.name, icon: <User size={16} /> },
                        { label: 'Email address', value: profile?.email, icon: <Mail size={16} /> },
                        { label: 'Phone number', value: profile?.phone || '+91 98765 43210', icon: <Phone size={16} /> },
                        { label: 'Joined date', value: 'January 2024', icon: <Calendar size={16} /> },
                        { label: 'Total missions', value: '1,284', icon: <Truck size={16} /> },
                        { label: 'Base location', value: profile?.city || 'Indore, MP', icon: <MapPin size={16} /> },
                    ].map((field, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-zinc-800/30">
                            <div className="text-[#028A0F] opacity-70">{field.icon}</div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{field.label}</p>
                                <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{field.value || 'N/A'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ),
            vehicle: (
                <div className="space-y-1">
                    <div className="py-3 border-b border-slate-50 dark:border-zinc-800/30">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Active vehicle</p>
                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">{profile?.vehicleType || 'Two wheeler'}</h3>
                        <p className="text-xs font-medium text-[#028A0F]">{profile?.vehicleNumber || 'MP-09-AB-1234'}</p>
                    </div>
                    {[
                        { label: 'Registration no', value: profile?.vehicleNumber || 'MP-09-AB-1234' },
                        { label: 'Insurance policy', value: 'POL-882104-XX', status: 'Active' },
                        { label: 'Emission cert', value: 'VALID-2025', status: 'Expiring soon' },
                        { label: 'Permit type', value: 'All india commercial' },
                    ].map((field, i) => (
                        <div key={i} className="py-2.5 border-b border-slate-50 dark:border-zinc-800/30">
                            <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-tighter">{field.label}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{field.value}</p>
                                {field.status && (
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${field.status === 'Active' ? 'text-emerald-500 bg-emerald-500/5' : 'text-orange-500 bg-orange-500/5'}`}>
                                        {field.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ),
            bank: (
                <div className="space-y-1">
                    <div className="py-3 border-b border-slate-50 dark:border-zinc-800/30">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Primary settlement account</p>
                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">{profile?.bankDetails?.bankName || 'HDFC Bank Ltd'}</h3>
                        <p className="text-sm font-medium font-mono tracking-widest text-[#028A0F]">**** **** {profile?.bankDetails?.accountNumber?.slice(-4) || '8842'}</p>
                    </div>
                    <button className="text-[11px] font-bold text-[#028A0F] hover:underline py-2 uppercase tracking-wide">Update payout methods</button>
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-zinc-800/30 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-[9px] font-bold text-slate-400 italic">Financial verification status</p>
                        <div className="flex items-center gap-2 mt-0.5 text-emerald-500">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-bold">Successfully verified</span>
                        </div>
                    </div>
                </div>
            ),
            security: (
                <div className="space-y-0.5">
                    {[
                        { label: 'Change password', icon: <Lock size={16} /> },
                        { label: 'Two-factor authentication', icon: <Smartphone size={16} />, status: 'On' },
                        { label: 'Active sessions', icon: <Smartphone size={16} />, status: '3 Active' },
                        { label: 'Biometric access', icon: <User size={16} />, status: 'Setup' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-zinc-800/30 cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="text-slate-400">{item.icon}</div>
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-100 group-hover:text-[#028A0F] transition-colors">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.status && <span className="text-[9px] font-bold text-[#028A0F] uppercase tracking-tighter">{item.status}</span>}
                                <ChevronRight size={14} className="text-slate-300" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        };
        return views[selectedView] || (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText size={28} className="text-slate-200 mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">Information pending</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Under tactical review</p>
            </div>
        );
    };

    if (selectedView !== 'menu') {
        return (
            <div className="space-y-4 pb-6 min-h-screen">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedView('menu')}
                        className="text-slate-400 hover:text-[#028A0F] transition-all p-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 dark:text-zinc-100">
                            {menuItems.find(i => i.id === selectedView)?.label || 'Information'}
                        </h1>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest tracking-tighter">Fleet partner info</p>
                    </div>
                </div>
                {renderSubView()}
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-10 min-h-screen">
            {/* Header / Avatar - Ultra Compact */}
            <div className="flex items-center gap-4 py-2">
                <div className="relative">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800">
                        <img
                            src={profile?.profileImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                            className="w-full h-full object-cover bg-white"
                            alt="avatar"
                        />
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#028A0F] text-white rounded-lg shadow-lg flex items-center justify-center cursor-pointer border-2 border-white dark:border-zinc-900 transition-transform active:scale-90">
                        <Camera size={12} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{profile?.name || 'Partner'}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[#028A0F] font-bold text-[10px] uppercase tracking-wider">Elite carrier</p>
                        <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                        <p className="text-slate-400 font-bold text-[10px]">{profile?.uniqueId || 'RDR-001'}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Compact Text Row */}
            <div className="flex justify-between py-2.5 border-y border-slate-50 dark:border-zinc-800/30 px-1">
                <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Partner level</p>
                    <p className="text-sm font-black text-slate-800 dark:text-zinc-100">04</p>
                </div>
                <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Service rating</p>
                    <p className="text-sm font-black text-slate-800 dark:text-zinc-100">4.9</p>
                </div>
                <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-right">Completed ops</p>
                    <p className="text-sm font-black text-slate-800 dark:text-zinc-100 text-right">1,284</p>
                </div>
            </div>

            {/* Menu List - Tight vertical list, no cards */}
            <div className="space-y-0.5">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (item.toggle) return;
                            if (item.isLink) {
                                navigate(item.path);
                            } else {
                                setSelectedView(item.id);
                            }
                        }}
                        className="flex items-center gap-4 py-3.5 border-b border-slate-50 dark:border-zinc-800/30 cursor-pointer group active:opacity-60 transition-all px-0.5"
                    >
                        <div className={`${item.color} opacity-80 group-hover:scale-105 transition-transform`}>
                            {React.cloneElement(item.icon, { size: 20 })}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 group-hover:text-[#028A0F] transition-colors">{item.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate uppercase tracking-tighter">{item.sub}</p>
                        </div>
                        {item.toggle ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                                className={`w-8 h-4.5 rounded-full relative transition-colors duration-300 ${notifications ? 'bg-[#028A0F]' : 'bg-slate-200 dark:bg-zinc-800'}`}
                            >
                                <motion.div
                                    animate={{ x: notifications ? 14 : 2 }}
                                    className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        ) : (
                            <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-all" />
                        )}
                    </div>
                ))}

                {/* Logout Row - Integrated list item */}
                <div
                    onClick={handleLogout}
                    className="flex items-center gap-4 py-4 cursor-pointer group active:opacity-60 transition-all border-b border-slate-50 dark:border-zinc-800/30 px-0.5"
                >
                    <div className="text-red-500 opacity-80 group-hover:scale-105 transition-transform">
                        <LogOut size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm text-red-500">Log out</h4>
                        <p className="text-[10px] text-red-300 mt-0.5 uppercase tracking-tighter">End current duty session</p>
                    </div>
                    <ChevronRight size={16} className="text-red-100 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>

            {/* Footer - Compact Minimalist */}
            <div className="py-6 text-center">
                <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em] dark:text-zinc-700">Sathigro ops • v1.2.4</p>
            </div>
        </div>
    );
};

export default ProfileSettings;
