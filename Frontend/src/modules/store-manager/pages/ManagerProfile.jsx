import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Mail, Phone, Lock, Camera, Loader2, ShieldCheck, UserSquare, ShieldAlert, Key, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStoreManagerAuth } from '../context/StoreManagerAuthContext';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
    const { managerUser, managerUpdateProfile } = useStoreManagerAuth();
    const user = managerUser;
    const updateProfile = managerUpdateProfile;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || '',
                newPassword: '',
                confirmPassword: ''
            });
            setImagePreview(user.profileImage || null);
        }
    }, [user]);

    const validateField = (name, value) => {
        let error = '';
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6789]\d{9}$/;

        if (name === 'name' && !nameRegex.test(value)) {
            error = 'Invalid name formatting';
        } else if (name === 'email' && !emailRegex.test(value)) {
            error = 'Invalid email structure';
        } else if (name === 'phone' && !phoneRegex.test(value)) {
            error = 'Invalid 10-digit mobile number';
        } else if (name === 'newPassword' && value.length > 0 && value.length < 8) {
            error = 'Minimum 8 characters required';
        } else if (name === 'confirmPassword' && value !== formData.newPassword) {
            error = 'Passwords do not match';
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (value) validateField(name, value);
        else setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return toast.error('Max file size 2MB');
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdatePersonal = async (e) => {
        e.preventDefault();

        const isNameValid = validateField('name', formData.name);
        const isEmailValid = validateField('email', formData.email);
        const isPhoneValid = validateField('phone', formData.phone);

        if (!isNameValid || !isEmailValid || !isPhoneValid) {
            return toast.error('Check input validation errors');
        }

        setSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);

            if (selectedFile) {
                data.append('profileImage', selectedFile);
            }

            await updateProfile(data);
            toast.success('Profile updated');
            setSelectedFile(null);
        } catch (error) {
            toast.error(error.message || 'Profile update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!formData.newPassword) return toast.error('Enter new security key');
        
        const isPasswordValid = validateField('newPassword', formData.newPassword);
        const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);

        if (!isPasswordValid || !isConfirmValid) {
            return toast.error('Verify new password requirements');
        }

        setLoading(true);
        try {
            await updateProfile({
                password: formData.newPassword
            });
            toast.success('Password updated');
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            setErrors(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (error) {
            toast.error(error.message || 'Password update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">View and update your profile details and password.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-sm uppercase tracking-widest text-[10px] font-black text-blue-600">
                    <ShieldCheck size={16} /> Manager Access
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Visual Identity */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-24 bg-slate-50 border-b border-slate-100"></div>
                        
                        <div className="relative mt-4 mb-6">
                            <div className="w-32 h-32 bg-white border-4 border-white rounded-[2rem] flex items-center justify-center overflow-hidden shadow-xl ring-1 ring-slate-100">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-slate-900 font-black text-5xl">{(formData.name || 'N').charAt(0).toUpperCase()}</div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute bottom-[-8px] right-[-8px] p-3 bg-blue-600 text-white rounded-2xl shadow-lg border-2 border-white hover:bg-blue-700 transition-all active:scale-95 group-hover:rotate-12"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        
                        <div className="space-y-1 relative">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{formData.name || 'Setup Name'}</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formData.role} • {user?.branchId?.name}</p>
                        </div>

                        <div className="w-full h-px bg-slate-100 my-8"></div>
                        
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Authorized
                                </span>
                            </div>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                Update Photo
                            </button>
                        </div>
                    </div>

                    {/* Security Key Update */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Key size={80} className="text-white" />
                        </div>
                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 mb-8 relative">
                            <Lock size={16} className="text-blue-500" /> Change Password
                        </h3>
                        <form onSubmit={handleUpdatePassword} className="space-y-6 relative">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full bg-white/5 border ${errors.newPassword ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'} rounded-2xl py-4 px-5 text-sm text-white focus:outline-none transition-all font-bold placeholder:text-white/10`}
                                    placeholder="Min. 8 characters"
                                />
                                {errors.newPassword && <p className="text-[10px] font-black text-red-500 mt-1 uppercase px-1">{errors.newPassword}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:border-blue-500/50'} rounded-2xl py-4 px-5 text-sm text-white focus:outline-none transition-all font-bold placeholder:text-white/10`}
                                    placeholder="Confirm password"
                                />
                                {errors.confirmPassword && <p className="text-[10px] font-black text-red-500 mt-1 uppercase px-1">{errors.confirmPassword}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !formData.newPassword || !!errors.newPassword || !!errors.confirmPassword}
                                className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-white/5 active:scale-95 group-hover:bg-blue-600 group-hover:text-white"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Update Password <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Registry Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden h-full flex flex-col">
                        <form onSubmit={handleUpdatePersonal} className="flex flex-col h-full">
                            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/50 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 text-blue-600 shadow-sm">
                                        <UserSquare size={24} />
                                    </div>
                                     <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tight">Profile Details</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update your contact information</p>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving || !!errors.name || !!errors.email || !!errors.phone}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-200 active:scale-95"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={18} /> Save Profile</>}
                                </button>
                            </div>
                            
                            <div className="p-10 flex-1 space-y-10">
                                <section className="space-y-6">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                                        <div className="w-1 h-3 bg-blue-600 rounded-full"></div> Personal Info
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><User size={12} /> Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className={`w-full bg-slate-50 border ${errors.name ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'} rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none shadow-sm`}
                                            />
                                            {errors.name && <p className="text-[10px] font-black text-red-500 mt-1 uppercase">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail size={12} /> Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className={`w-full bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'} rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none shadow-sm`}
                                            />
                                            {errors.email && <p className="text-[10px] font-black text-red-500 mt-1 uppercase">{errors.email}</p>}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6 pt-6 border-t border-slate-50">
                                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                                        <div className="w-1 h-3 bg-blue-600 rounded-full"></div> Store Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={12} /> Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="+91 0000000000"
                                                className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:border-blue-400'} rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 focus:bg-white transition-all outline-none shadow-sm`}
                                            />
                                            {errors.phone && <p className="text-[10px] font-black text-red-500 mt-1 uppercase">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><ShieldAlert size={12} /> Account Role</label>
                                            <div className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-4 px-5 text-sm text-slate-400 font-black uppercase tracking-widest cursor-not-allowed italic">
                                                Locked: {formData.role}
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 ml-1 tracking-tighter">* Contact support for permissions change</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManagerProfile = () => <ProfileSettings />;
export default ManagerProfile;
