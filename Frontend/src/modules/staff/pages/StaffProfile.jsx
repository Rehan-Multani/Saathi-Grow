import React, { useState, useEffect, useRef } from 'react';
import { Save, User, Mail, Phone, Lock, Camera, Loader2, ShieldCheck, Key, Settings, UserCheck } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const { staffUser, staffUpdateProfile } = useStaffAuth();
  const user = staffUser;
  const updateProfile = staffUpdateProfile;

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
      error = 'Letters only (2-50 chars)';
    } else if (name === 'email' && !emailRegex.test(value)) {
      error = 'Invalid email';
    } else if (name === 'phone' && !phoneRegex.test(value)) {
      error = 'Invalid phone';
    } else if (name === 'newPassword' && value && value.length < 8) {
      error = 'Min. 8 chars';
    } else if (name === 'confirmPassword' && value !== formData.newPassword) {
      error = 'Match fail';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error('Max 2MB file size');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    if (!validateField('name', formData.name) || !validateField('email', formData.email) || !validateField('phone', formData.phone)) {
      return toast.error('Check your identity fields');
    }
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      if (selectedFile) data.append('profileImage', selectedFile);
      await updateProfile(data);
      toast.success('Done');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validateField('newPassword', formData.newPassword) || !validateField('confirmPassword', formData.confirmPassword)) {
      return toast.error('Check password fields');
    }
    setLoading(true);
    try {
      await updateProfile({ password: formData.newPassword });
      toast.success('Done');
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (error) {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left font-black">
      <div className="text-left px-1 space-y-2 font-black">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none font-black text-left font-black">Account Settings</h1>
        <div className="flex items-center gap-3 font-black text-left">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic leading-none font-black text-left font-black font-black">
                <UserCheck size={12} className="shrink-0" /> User Core
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left font-black font-black">Update your profile info.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left font-black">
        {/* Profile Card */}
        <div className="md:col-span-4 space-y-6 text-left font-black font-black">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 text-center relative overflow-hidden group font-black font-black">
                <div className="absolute right-0 top-0 w-40 h-full bg-blue-50/50 blur-3xl pointer-events-none rounded-full font-black text-left font-black" />
                
                <div className="relative inline-block mb-6 pt-4 text-left font-black font-black">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 overflow-hidden border-4 border-white shadow-2xl shadow-slate-200 flex items-center justify-center font-black font-black">
                        {imagePreview ? (
                            <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" alt="av" />
                        ) : (
                            <span className="text-white text-5xl font-black uppercase font-black">{(formData.name || 'U').charAt(0)}</span>
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="absolute -bottom-1 -right-1 w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-3xl border-4 border-white flex items-center justify-center hover:bg-black transition-all active:scale-90 font-black font-black"
                    >
                        <Camera size={18} />
                    </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none font-black text-center font-black">{formData.name}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mt-3.5 mb-8 leading-none italic font-black text-center font-black">{formData.role} Domain</p>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden font-black font-black" accept="image/*" />
                
                <button 
                   onClick={() => fileInputRef.current.click()}
                   className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all italic leading-none font-black font-black font-black"
                >
                    Change Picture
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 space-y-6 text-left relative overflow-hidden font-black font-black">
                <div className="flex items-center gap-3 mb-2 text-left font-black font-black font-black">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full font-black text-left font-black font-black" />
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] italic leading-none font-black text-left font-black font-black">Security</h4>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 text-left font-black font-black font-black">
                    <div className="space-y-3 text-left font-black font-black font-black">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic font-black leading-none text-left font-black font-black">New Password</label>
                        <div className="relative group text-left font-black font-black font-black">
                            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input 
                                type="password" 
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all italic font-black text-left font-black font-black"
                            />
                        </div>
                        {errors.newPassword && <p className="text-[9px] font-black text-red-500 uppercase italic ml-2 leading-none font-black text-left font-black font-black">{errors.newPassword}</p>}
                    </div>

                    <div className="space-y-3 text-left font-black font-black font-black">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic font-black leading-none text-left font-black font-black">Confirm</label>
                        <div className="relative group text-left font-black font-black font-black">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input 
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all italic font-black text-left font-black font-black"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-[9px] font-black text-red-500 uppercase italic ml-2 leading-none font-black text-left font-black font-black">{errors.confirmPassword}</p>}
                    </div>

                    <button 
                         type="submit"
                         disabled={loading || !formData.newPassword || errors.newPassword || errors.confirmPassword}
                         className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 italic leading-none font-black font-black font-black"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Security'}
                    </button>
                </form>
            </div>
        </div>

        {/* Identity Card */}
        <div className="md:col-span-8 text-left font-black font-black">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 lg:p-12 space-y-10 text-left h-full relative overflow-hidden font-black font-black">
                <div className="flex justify-between items-center mb-4 text-left font-black font-black">
                    <div className="flex items-center gap-4 text-left font-black font-black">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full font-black text-left font-black font-black" />
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] italic leading-none font-black text-left font-black font-black">Info Hub</h4>
                    </div>
                </div>

                <form onSubmit={handleUpdatePersonal} className="space-y-10 text-left font-black font-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left font-black font-black">
                        <div className="space-y-4 text-left font-black font-black">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic leading-none font-black text-left font-black font-black">Full Name</label>
                            <div className="relative group text-left font-black font-black">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-16 pr-8 py-5.5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all uppercase italic font-black text-left font-black font-black"
                                    required
                                />
                            </div>
                            {errors.name && <p className="text-[9px] font-black text-red-500 uppercase italic ml-2 leading-none font-black text-left font-black font-black">{errors.name}</p>}
                        </div>

                        <div className="space-y-4 text-left font-black font-black">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic leading-none font-black text-left font-black font-black">Email</label>
                            <div className="relative group text-left font-black font-black">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input 
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-16 pr-8 py-5.5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all lowercase italic font-black text-left font-black font-black"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-[9px] font-black text-red-500 uppercase italic ml-2 leading-none font-black text-left font-black font-black">{errors.email}</p>}
                        </div>

                        <div className="space-y-4 text-left font-black font-black">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic leading-none font-black text-left font-black font-black">Phone</label>
                            <div className="relative group text-left font-black font-black">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input 
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-16 pr-8 py-5.5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-400/10 focus:border-blue-400 shadow-sm transition-all font-mono italic font-black text-left font-black font-black"
                                    required
                                />
                            </div>
                            {errors.phone && <p className="text-[9px] font-black text-red-500 uppercase italic ml-2 leading-none font-black text-left font-black font-black">{errors.phone}</p>}
                        </div>

                        <div className="space-y-4 text-left font-black font-black">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 italic leading-none font-black text-left font-black font-black">Assigned Role</label>
                            <div className="w-full pl-8 pr-8 py-5.5 bg-slate-50 border border-slate-100 rounded-[1.8rem] text-sm font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-4 font-black text-left font-black font-black font-black">
                                <ShieldCheck size={20} className="text-slate-200 shrink-0 font-black font-black" /> {formData.role}
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex justify-end text-left font-black font-black">
                        <button 
                             type="submit"
                             disabled={saving || errors.name || errors.email || errors.phone}
                             className="px-14 py-6 bg-blue-600 text-white rounded-[1.8rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-3xl shadow-blue-500/30 hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4 italic leading-none shrink-0 font-black font-black font-black"
                        >
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} /> } Save Info
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

const StaffProfile = () => <ProfileSettings />;

export default StaffProfile;
