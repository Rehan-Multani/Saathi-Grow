import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, Languages } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { adminLogin } = useAdminAuth();
    const navigate = useNavigate();

    const currentLang = i18n.language || 'en';

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError(t('common.password_min_length'));
            return;
        }

        setLoading(true);

        try {
            await adminLogin(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(t('common.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 relative">
                
                {/* Language Switcher on Login */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button 
                        onClick={() => changeLanguage('en')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${currentLang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => changeLanguage('hi')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${currentLang === 'hi' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        हिन्दी
                    </button>
                </div>

                {/* Login Form Section */}
                <div className="p-8 w-full">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <ShieldCheck className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{t('common.admin_portal')}</h2>
                        <p className="text-gray-500 text-sm font-medium">{t('common.sign_in_to_manage')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1">{t('common.email_address')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-600">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-100 border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                                    placeholder="admin@sathigro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1">{t('common.password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-blue-600">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-3 bg-gray-50 border-gray-100 border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-xs font-bold text-gray-600 cursor-pointer select-none">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer appearance-none w-4 h-4 rounded border-2 border-gray-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" />
                                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity left-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="ml-2">{t('common.remember_me')}</span>
                            </label>
                            <a href="#" className="text-xs font-black text-blue-600 hover:text-blue-700">{t('common.forgot_password')}</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-blue-500/30 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <span className="flex items-center gap-3">
                                    {t('common.sign_in')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        &copy; 2026 SathiGro. {t('common.all_rights_reserved')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
