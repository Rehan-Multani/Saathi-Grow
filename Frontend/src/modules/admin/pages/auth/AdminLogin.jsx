import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
    const { t } = useTranslation('admin_login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('error_password_length', 'Password must be at least 6 characters'));
            return;
        }

        setLoading(true);

        try {
            await adminLogin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(t('error_invalid', 'Invalid email or password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-[440px] overflow-hidden p-10 relative z-10">
                
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] mb-6 transform hover:rotate-6 transition-transform">
                        <ShieldCheck className="text-white" size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('title', 'Admin Login')}</h2>
                    <p className="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-widest leading-none">{t('subtitle', 'Strategic Gateway')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-2xl text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{t('email', 'Access ID / Email')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[15px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 focus:bg-white transition-all"
                                placeholder="name@saathigrow.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{t('password', 'Secure Key')}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[15px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100/50 focus:border-blue-600 focus:bg-white transition-all"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <label className="flex items-center gap-3 cursor-pointer select-none group">
                            <div className="relative flex items-center">
                                <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                                <div className="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('remember_me', 'Preserve Session')}</span>
                        </label>
                        <Link to="/admin/forgot-password" size="sm" className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider">
                            {t('forgot_password', 'Recovery')}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full flex items-center justify-center py-5 px-6 rounded-2xl text-[13px] font-black text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_20px_40px_-12px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] active:scale-[0.98] uppercase tracking-[0.2em]"
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <span className="flex items-center gap-3">
                                {t('sign_in', 'Authenticate')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        &copy; 2026 SAATHIGROW • ENCRYPTED ACCESS
                    </p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out infinite; animation-iteration-count: 2; }
                body { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
            `}} />
        </div>
    );
};

export default AdminLogin;
