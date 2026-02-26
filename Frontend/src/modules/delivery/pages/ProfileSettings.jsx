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

const ProfileSettings = () => {
    const [notifications, setNotifications] = useState(true);

    const menuItems = [
        { icon: <User size={20} />, label: 'Personal Information', sub: 'Name, Email, Phone', color: 'text-blue-500 bg-blue-50' },
        { icon: <Truck size={20} />, label: 'Vehicle Details', sub: 'Bike - MP 09 AB 1234', color: 'text-orange-500 bg-orange-50' },
        { icon: <CreditCard size={20} />, label: 'Bank Details', sub: 'HDFC Bank - **** 8920', color: 'text-emerald-500 bg-emerald-50' },
        { icon: <Bell size={20} />, label: 'Notifications', sub: 'Manage alerts & sounds', color: 'text-purple-500 bg-purple-50', toggle: true },
        { icon: <Shield size={20} />, label: 'Security & Privacy', sub: 'Password, Biometrics', color: 'text-red-500 bg-red-50' },
        { icon: <HelpCircle size={20} />, label: 'Help & Support', sub: 'FAQs, Contact us', color: 'text-slate-500 bg-slate-50' },
    ];

    return (
        <div className="max-w-lg mx-auto space-y-8 pb-20">
            {/* Header / Avatar - Compacted */}
            <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-lime-500 to-lime-600 p-0.5 shadow-xl shadow-lime-500/20">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            className="w-full h-full rounded-[1.9rem] object-cover bg-white"
                            alt="avatar"
                        />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg flex items-center justify-center text-lime-600 border border-slate-100 dark:border-zinc-700 hover:scale-110 active:scale-90 transition-transform">
                        <Camera size={16} />
                    </button>
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100">Rahul Kumar</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Tactical Partner â€¢ Indore</p>
                </div>

                <div className="flex gap-2">
                    <div className="px-4 py-1.5 bg-lime-500/5 dark:bg-lime-500/10 rounded-full flex items-center gap-2 border border-lime-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-500"></div>
                        <span className="text-[10px] font-black text-lime-600 uppercase tracking-widest">Level 4</span>
                    </div>
                    <div className="px-4 py-1.5 bg-sky-500/5 dark:bg-sky-500/10 rounded-full flex items-center gap-2 border border-sky-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                        <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">4.9 Star</span>
                    </div>
                </div>
            </div>

            {/* Menu List - Higher Density */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200/60 dark:border-zinc-800/60 p-2 shadow-sm">
                {menuItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3.5 p-3.5 rounded-[1.8rem] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color.split(' ')[0]} ${item.color.split(' ')[1]} dark:bg-opacity-10 border border-current border-opacity-5 transition-transform group-hover:scale-105`}>
                            {React.cloneElement(item.icon, { size: 18 })}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 leading-tight">{item.label}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.sub}</p>
                        </div>
                        {item.toggle ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                                className={`w-10 h-5.5 rounded-full relative transition-colors duration-300 ${notifications ? 'bg-lime-500' : 'bg-slate-200 dark:bg-zinc-800'}`}
                            >
                                <motion.div
                                    animate={{ x: notifications ? 20 : 2 }}
                                    className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        ) : (
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-lime-500 transition-colors" />
                        )}
                    </div>
                ))}

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50">
                    <button className="flex items-center gap-3.5 w-full p-3.5 rounded-[1.8rem] hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-red-500 group">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-500/10">
                            <LogOut size={18} />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="font-bold text-sm leading-tight">Logout</h4>
                            <p className="text-[9px] text-red-300 font-bold uppercase tracking-widest mt-0.5">End Duty</p>
                        </div>
                        <ChevronRight size={16} className="text-red-200" />
                    </button>
                </div>
            </div>

            {/* Footer / Version - Slimmer */}
            <div className="text-center space-y-3 pt-2">
                <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                        <Smartphone size={18} className="text-slate-400 mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">v1.2.4</span>
                    </div>
                    <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                        <HelpCircle size={18} className="text-slate-400 mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Support</span>
                    </div>
                </div>
                <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.3em] dark:text-zinc-600">SathiGro Digital Hub</p>
            </div>
        </div>
    );
};

export default ProfileSettings;

