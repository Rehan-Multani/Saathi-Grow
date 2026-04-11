import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { resetAdminPassword } from '../../api/adminApi';
import { toast } from 'react-toastify';
import logo from '../../../../assets/logo.png';

const ResetPassword = () => {
    const { t, i18n } = useTranslation('admin_login');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (password.length < 8) {
            return toast.error('Password must be at least 8 characters');
        }

        setLoading(true);

        try {
            await resetAdminPassword(token, password);
            setSuccess(true);
            toast.success(t('reset.success_title'));
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err) {
            toast.error(err.message || 'Access token invalid or expired');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1D] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
            
             {/* Language Switcher */}
             <div className="absolute top-8 right-8 z-20 flex gap-2">
                <button
                    onClick={() => changeLanguage('en')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                >
                    English
                </button>
                <button
                    onClick={() => changeLanguage('hi')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${i18n.language === 'hi' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                >
                    हिन्दी
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] w-full max-w-[420px] overflow-hidden p-10 relative z-10 animate-in zoom-in duration-500">
                
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-24 h-24 mb-6 transition-transform hover:scale-105 duration-500">
                        <img src={logo} alt="SaathiGrow Logo" className="w-full h-full object-contain" />
                    </div>

                    {!success ? (
                        <>
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('reset.title')}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-60 leading-none">{t('reset.subtitle')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 w-full">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('reset.new_password')}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 transition-colors group-focus-within:text-blue-500">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-blue-600 transition-colors border-none bg-transparent"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('reset.confirm_password')}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 transition-colors group-focus-within:text-blue-500">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="block w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-sans"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-[11px] font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] active:scale-[0.98] uppercase tracking-[0.2em] border-none group"
                                >
                                    {loading ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            {t('reset.submit')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t('reset.success_title')}</h3>
                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8 px-4 opacity-70 italic">
                                {t('reset.success_msg')}
                            </p>
                            <div className="flex justify-center">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                            </div>
                        </div>
                    )}

                    <p className="mt-12 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] leading-none">
                        &copy; 2026 SAATHIGROW • Security Hub
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
