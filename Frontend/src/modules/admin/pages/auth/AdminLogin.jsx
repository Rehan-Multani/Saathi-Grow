import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, ChevronDown, Store, Users, ShoppingBag, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
    const { t, i18n } = useTranslation('admin_login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPortals, setShowPortals] = useState(false);
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-[420px] px-10 pt-10 pb-10 relative">

                {/* Language Switcher */}
                <div className="absolute top-4 right-4 flex gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('hi')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'hi' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        हिन्दी
                    </button>
                </div>

                {/* Shield Icon */}
                <div className="flex justify-center mb-6 mt-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <ShieldCheck size={38} className="text-white" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
                    <p className="text-sm text-gray-400 mt-1">Sign in to manage saathigro</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('email')}</label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <Mail size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="email"
                                required
                                className="flex-1 text-sm font-semibold text-gray-800 placeholder:text-gray-400 w-full py-3.5 admin-login-input"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('password')}</label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <Lock size={18} className="text-gray-400 shrink-0" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="flex-1 text-sm font-semibold text-gray-800 placeholder:text-gray-400 w-full admin-login-input"
                                placeholder="••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember me + Forgot password */}
                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-gray-600">Remember me</span>
                        </label>
                        <Link to="/admin/forgot-password" className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors">
                            {t('forgot_password')}
                        </Link>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-blue-200 border-none mt-2"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                {t('sign_in')} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Portal Links Accordion */}
                <div className="mt-6 border border-gray-100 rounded-2xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowPortals(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Other Portals</span>
                        <ChevronDown size={15} className={`text-gray-400 transition-transform duration-300 ${showPortals ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${showPortals ? 'max-h-48' : 'max-h-0'}`}>
                        <div className="p-3 space-y-2 bg-white">
                            {[
                                { label: 'Store Manager', icon: <Store size={14} />, url: 'http://saathigro.in/store-manager/login', color: 'text-purple-600 bg-purple-50 border-purple-100' },
                                { label: 'Staff Portal', icon: <Users size={14} />, url: 'http://saathigro.in/staff/login', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                                { label: 'Vendor Portal', icon: <ShoppingBag size={14} />, url: 'http://saathigro.in/vendor/login', color: 'text-orange-600 bg-orange-50 border-orange-100' },
                            ].map(({ label, icon, url, color }) => (
                                <a
                                    key={label}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm ${color}`}
                                >
                                    {icon}
                                    <span>{label}</span>
                                    <ExternalLink size={11} className="ml-auto opacity-50" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-6">
                    &copy; 2026 saathigro. ALL RIGHTS RESERVED.
                </p>
            </div>

            <style>{`
                input[type="email"].admin-login-input, 
                input[type="password"].admin-login-input, 
                input[type="text"].admin-login-input {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                    padding: 14px 0 !important;
                    font-size: 14px !important;
                    line-height: 24px !important;
                    height: 52px !important;
                }
                input[type="email"].admin-login-input:focus, 
                input[type="password"].admin-login-input:focus, 
                input[type="text"].admin-login-input:focus {
                    background-color: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
