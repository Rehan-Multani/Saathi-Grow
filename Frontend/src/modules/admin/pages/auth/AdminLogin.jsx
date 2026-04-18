import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
    const { t, i18n } = useTranslation('admin_login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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
                    <p className="text-sm text-gray-400 mt-1">Sign in to manage SathiGro</p>
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
                        <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
                            <Mail size={18} className="text-gray-400 shrink-0" />
                            <input
                                type="email"
                                required
                                className="bg-transparent flex-1 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none"
                                placeholder="admin@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{t('password')}</label>
                        <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-3.5">
                            <Lock size={18} className="text-gray-400 shrink-0" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="bg-transparent flex-1 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none"
                                placeholder="••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-blue-600 transition-colors bg-transparent border-none p-0"
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

                <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-8">
                    &copy; 2026 SATHIGRO. ALL RIGHTS RESERVED.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
