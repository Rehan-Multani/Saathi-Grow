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
    CheckCircle2,
    MessageCircle,
    Loader2
} from 'lucide-react';
import useDeliveryStore from '../store/deliveryStore';
import { toast } from 'react-toastify';
import { updateDeliveryProfile, changeDeliveryPassword } from '../api/deliveryAuthApi';

const ProfileSettings = () => {
    const { profile, logout, token, fetchProfile } = useDeliveryStore();
    const [notifications, setNotifications] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedView, setSelectedView] = useState('menu');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [savingVehicle, setSavingVehicle] = useState(false);
    const [vehicleData, setVehicleData] = useState({ vehicleType: '', vehicleNumber: '' });
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
        return localStorage.getItem('delivery_2fa') !== 'false';
    });
    const [showActiveSessions, setShowActiveSessions] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
        navigate('/delivery/login');
    };

    const handleEditStart = () => {
        setEditData({ name: profile?.name || '', email: profile?.email || '', phone: profile?.phone || '' });
        setIsEditing(true);
    };

    const handleEditSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('email', editData.email);
            formData.append('phone', editData.phone);
            await updateDeliveryProfile(token, formData);
            await fetchProfile();
            setIsEditing(false);
            toast.success('Profile updated!');
        } catch {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleVehicleEditStart = () => {
        setVehicleData({ vehicleType: profile?.vehicleType || '', vehicleNumber: profile?.vehicleNumber || '' });
        setIsEditingVehicle(true);
    };

    const handleVehicleSave = async () => {
        setSavingVehicle(true);
        try {
            const formData = new FormData();
            formData.append('vehicleType', vehicleData.vehicleType);
            formData.append('vehicleNumber', vehicleData.vehicleNumber);
            await updateDeliveryProfile(token, formData);
            await fetchProfile();
            setIsEditingVehicle(false);
            toast.success('Vehicle details updated!');
        } catch {
            toast.error('Update failed');
        } finally {
            setSavingVehicle(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setSavingPassword(true);
        try {
            await changeDeliveryPassword(token, passwordData.currentPassword, passwordData.newPassword);
            toast.success('Password changed successfully!');
            setShowChangePassword(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
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
                <div className="space-y-4">
                    {/* Edit / Save buttons */}
                    <div className="flex justify-end">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                <button onClick={handleEditSave} disabled={saving} className="px-4 py-1.5 text-xs font-bold text-white bg-[#028A0F] rounded-xl hover:bg-[#026b0c] transition-all flex items-center gap-1.5 disabled:opacity-60">
                                    {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                    Save
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleEditStart} className="px-4 py-1.5 text-xs font-bold text-[#028A0F] border border-[#028A0F]/30 rounded-xl hover:bg-[#028A0F]/5 transition-all">
                                Edit
                            </button>
                        )}
                    </div>

                    {/* Editable fields */}
                    {[
                        { label: 'Full name', key: 'name', icon: <User size={16} />, editable: true },
                        { label: 'Email address', key: 'email', icon: <Mail size={16} />, editable: true, type: 'email' },
                        { label: 'Phone number', key: 'phone', icon: <Phone size={16} />, editable: true, type: 'tel' },
                    ].map((field, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-zinc-800/30">
                            <div className="text-[#028A0F] opacity-70 shrink-0">{field.icon}</div>
                            <div className="flex-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{field.label}</p>
                                {isEditing ? (
                                    <input
                                        type={field.type || 'text'}
                                        value={editData[field.key]}
                                        onChange={e => setEditData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                        className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#028A0F] transition-colors"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-slate-800 dark:text-zinc-100">{profile?.[field.key] || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Read-only fields */}
                    {[
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
                <div className="space-y-4">
                    {/* Edit / Save buttons */}
                    <div className="flex justify-end">
                        {isEditingVehicle ? (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingVehicle(false)} className="px-4 py-1.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                                <button onClick={handleVehicleSave} disabled={savingVehicle} className="px-4 py-1.5 text-xs font-bold text-white bg-[#028A0F] rounded-xl hover:bg-[#026b0c] transition-all flex items-center gap-1.5 disabled:opacity-60">
                                    {savingVehicle ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                    Save
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleVehicleEditStart} className="px-4 py-1.5 text-xs font-bold text-[#028A0F] border border-[#028A0F]/30 rounded-xl hover:bg-[#028A0F]/5 transition-all">
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="py-3 border-b border-slate-50 dark:border-zinc-800/30">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Active vehicle</p>
                        {isEditingVehicle ? (
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Vehicle type</p>
                                    <input
                                        type="text"
                                        value={vehicleData.vehicleType}
                                        onChange={e => setVehicleData(p => ({ ...p, vehicleType: e.target.value }))}
                                        placeholder="e.g. Bike, Scooter"
                                        className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#028A0F] transition-colors"
                                    />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Vehicle number</p>
                                    <input
                                        type="text"
                                        value={vehicleData.vehicleNumber}
                                        onChange={e => setVehicleData(p => ({ ...p, vehicleNumber: e.target.value }))}
                                        placeholder="e.g. MP09AB1234"
                                        className="w-full text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-[#028A0F] transition-colors uppercase"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">{profile?.vehicleType || 'Two wheeler'}</h3>
                                <p className="text-xs font-medium text-[#028A0F]">{profile?.vehicleNumber || 'MP-09-AB-1234'}</p>
                            </>
                        )}
                    </div>

                    {/* Read-only fields */}
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
                    {/* Two-factor authentication - Toggle */}
                    <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-zinc-800/30">
                        <div className="flex items-center gap-3">
                            <div className="text-slate-400"><Smartphone size={16} /></div>
                            <div>
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-100 block">Two-factor authentication</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {twoFactorEnabled ? 'OTP required on every login' : 'OTP verification off'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const next = !twoFactorEnabled;
                                setTwoFactorEnabled(next);
                                localStorage.setItem('delivery_2fa', String(next));
                                toast.success(`Two-factor authentication ${next ? 'enabled' : 'disabled'}`);
                            }}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 border-none ${twoFactorEnabled ? 'bg-[#028A0F]' : 'bg-slate-200'}`}
                        >
                            <motion.div
                                animate={{ x: twoFactorEnabled ? 20 : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    {/* Active sessions */}
                    <div>
                        <div
                            onClick={() => setShowActiveSessions(p => !p)}
                            className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-zinc-800/30 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-slate-400"><Smartphone size={16} /></div>
                                <span className="text-sm font-medium text-slate-800 dark:text-zinc-100 group-hover:text-[#028A0F] transition-colors">Active sessions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-[#028A0F] uppercase tracking-tighter">1 Active</span>
                                <ChevronRight size={14} className={`text-slate-300 transition-transform ${showActiveSessions ? 'rotate-90' : ''}`} />
                            </div>
                        </div>

                        {showActiveSessions && (
                            <div className="py-3 px-1 space-y-3 border-b border-slate-50">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#028A0F]/10 rounded-lg flex items-center justify-center">
                                            <Smartphone size={16} className="text-[#028A0F]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">This device</p>
                                            <p className="text-[9px] text-slate-400 font-medium">
                                                {navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'} • Active now
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-medium">
                                                Logged in as {profile?.name || 'Partner'} • {profile?.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Current</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium px-1">Only 1 active session found. You are logged in on this device only.</p>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 text-xs font-bold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all"
                                >
                                    Log out this session
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ),
            help: (
                <div className="space-y-6">
                    {/* Contact Hub */}
                    <div className="grid grid-cols-3 gap-3">
                        <a href="https://wa.me/919199899899" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 group active:scale-95 transition-all">
                            <MessageCircle size={20} className="text-emerald-600 mb-2" />
                            <span className="text-[10px] font-black uppercase text-emerald-700">WhatsApp</span>
                        </a>
                        <a href="tel:+919199899899" className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 group active:scale-95 transition-all">
                            <Phone size={20} className="text-blue-600 mb-2" />
                            <span className="text-[10px] font-black uppercase text-blue-700">Call HQ</span>
                        </a>
                        <a href="mailto:support@saathigrow.com" className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 group active:scale-95 transition-all">
                            <Mail size={20} className="text-slate-600 dark:text-zinc-400 mb-2" />
                            <span className="text-[10px] font-black uppercase text-slate-700 dark:text-zinc-300">Email</span>
                        </a>
                    </div>

                    {/* FAQ Section */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tactical FAQ</h4>
                        <div className="space-y-2">
                            {[
                                { q: "Mission Assignment Issues", a: "Check your data connection and ensure Duty Toggle is ON." },
                                { q: "Cash Liability Settlement", a: "Visit HQ within 24hrs once liability exceeds ₹8,000." },
                                { q: "Customer No-Response", a: "Call 3 times, then mark 'Failed' with 'User Unavailable' reason." },
                                { q: "App Performance", a: "Clear cache or update to latest v1.2.4 from Tactical Hub." }
                            ].map((faq, i) => (
                                <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl">
                                    <p className="text-xs font-black text-slate-800 dark:text-zinc-100 mb-1">{faq.q}</p>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-rose-50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/20">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={14} className="text-rose-600" />
                            <span className="text-[10px] font-black uppercase text-rose-700">Emergency Protocol</span>
                        </div>
                        <p className="text-[11px] font-medium text-rose-600/80 leading-relaxed">In case of accidents or vehicle failure during an active run, immediately contact Dispatch HQ via the <b>Call HQ</b> button above.</p>
                    </div>
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
                        onClick={() => { setSelectedView('menu'); setIsEditing(false); setIsEditingVehicle(false); setShowChangePassword(false); setShowActiveSessions(false); }}
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
