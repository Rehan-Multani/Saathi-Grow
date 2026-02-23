import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Camera,
    Truck,
    CreditCard,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    MapPin,
    Smartphone
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { toast } from 'react-toastify';
import { updateDeliveryProfile } from '../api/deliveryAuthApi';

const ProfileSettings = () => {
    const { profile, logout, token, fetchProfile } = useDeliveryStore();
    const [notifications, setNotifications] = useState(true);
    const [uploading, setUploading] = useState(false);

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
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
        { icon: <User size={20} />, label: 'Personal Information', sub: `${profile?.name || 'N/A'}, ${profile?.email || 'No Email'}`, color: 'text-blue-500 bg-blue-50' },
        { icon: <Truck size={20} />, label: 'Vehicle Details', sub: `${profile?.vehicleType || 'N/A'} - ${profile?.vehicleNumber || 'Pending'}`, color: 'text-orange-500 bg-orange-50' },
        { icon: <CreditCard size={20} />, label: 'Bank Details', sub: profile?.bankDetails?.bankName ? `${profile.bankDetails.bankName} - **** ${profile.bankDetails.accountNumber?.slice(-4)}` : 'Bank details not added', color: 'text-emerald-500 bg-emerald-50' },
        { icon: <Bell size={20} />, label: 'Notifications', sub: 'Manage alerts & sounds', color: 'text-purple-500 bg-purple-50', toggle: true },
        { icon: <Shield size={20} />, label: 'Security & Privacy', sub: 'Authentication & Access', color: 'text-red-500 bg-red-50' },
        { icon: <HelpCircle size={20} />, label: 'Help & Support', sub: 'FAQs, Contact us', color: 'text-slate-500 bg-slate-50' },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-lime-500 to-lime-600 p-1 shadow-2xl shadow-lime-500/30">
                        {uploading ? (
                            <div className="w-full h-full rounded-[2.3rem] bg-white flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <img
                                src={profile?.profileImage || `https://ui-avatars.com/api/?name=${profile?.name}&background=random`}
                                className="w-full h-full rounded-[2.3rem] object-cover bg-white"
                                alt="avatar"
                            />
                        )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl flex items-center justify-center text-lime-600 border border-slate-100 dark:border-zinc-700 hover:scale-110 transition-transform cursor-pointer">
                        <Camera size={20} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tight">{profile?.name}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Professional Partner â€¢ Indore</p>
                </div>

                <div className="flex gap-4">
                    <div className="px-5 py-2 bg-lime-50 dark:bg-lime-500/10 rounded-full flex items-center gap-2">
                        <Smartphone size={12} className="text-lime-500" />
                        <span className="text-xs font-bold text-lime-600 uppercase tracking-wider">{profile?.phone}</span>
                    </div>
                    <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{profile?.rating || '5.0'} Rating</span>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 p-4 shadow-sm">
                {menuItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} dark:bg-opacity-10`}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{item.label}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.sub}</p>
                        </div>
                        {item.toggle ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                                className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${notifications ? 'bg-lime-500' : 'bg-slate-200 dark:bg-zinc-800'}`}
                            >
                                <motion.div
                                    animate={{ x: notifications ? 22 : 4 }}
                                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        ) : (
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-lime-500 transition-colors" />
                        )}
                    </div>
                ))}

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full p-5 rounded-[2rem] hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-red-500 group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-bold leading-tight">Logout</h4>
                            <p className="text-[10px] text-red-300 font-bold uppercase tracking-wider mt-0.5">End your session</p>
                        </div>
                        <ChevronRight size={20} className="text-red-200" />
                    </button>
                </div>
            </div>

            {/* Footer / Version */}
            <div className="text-center space-y-4 pt-4">
                <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                        <Smartphone size={24} className="text-slate-300 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v1.2.4</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <HelpCircle size={24} className="text-slate-300 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saathi Care</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Designed with â¤ï¸ in Indore</p>
            </div>
        </div>
    );
};

export default ProfileSettings;

