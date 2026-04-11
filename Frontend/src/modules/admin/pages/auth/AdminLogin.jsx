import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Globe } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import logo from '../../../../assets/logo.png';

const AdminLogin = () => {
    const { t, i18n } = useTranslation('admin_login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('error_password_length'));
            return;
        }

        setLoading(true);

        try {
            await adminLogin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(t('error_invalid'));
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
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('title')}</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest opacity-60 leading-none">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('email')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-sans italic"
                                placeholder="example@saathigrow.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
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

                    <div className="flex items-center justify-end py-1">
                        <Link to="/admin/forgot-password" size="sm" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest italic">
                            {t('forgot_password')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex items-center justify-center py-4 px-6 rounded-2xl text-[11px] font-bold text-white bg-slate-900 hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] active:scale-[0.98] uppercase tracking-[0.2em] border-none"
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <span className="flex items-center gap-3">
                                {t('sign_in')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em] leading-none">
                        &copy; 2026 SAATHIGROW • Simplified Admin
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out infinite; animation-iteration-count: 2; }
            `}} />
        </div>
    );
};

export default AdminLogin;
