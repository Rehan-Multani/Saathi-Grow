import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Loader2, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error('Security Keys do not intersect. Please verify.');
        }

        if (password.length < 8) {
            return toast.error('Key depth insufficient. Minimum 8 characters required.');
        }

        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Security Credentials Updated');
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Access token invalid or expired');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 relative">
                
                <div className="p-10 w-full text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-slate-200 transform rotate-6 transition-transform hover:rotate-0 duration-500">
                            <ShieldAlert className="text-white" size={38} />
                        </div>
                    </div>

                    {!success ? (
                        <>
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter uppercase tracking-widest leading-none">New <span className="text-blue-600">Protocol</span></h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize new security credentials</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">New Security Key</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 transition-colors group-focus-within:text-blue-500">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-14 pr-14 py-4 bg-gray-50 border-transparent border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Confirm Protocol Key</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 transition-colors group-focus-within:text-blue-500">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center py-5 px-6 rounded-2xl shadow-xl shadow-blue-200 text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-black transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                                >
                                    {loading ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            Authorize Reset <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="py-6 scale-in-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Protocol Updated</h3>
                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
                                Your security credentials have been successfully updated. Redirecting to terminal...
                            </p>
                            <div className="flex justify-center">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                            </div>
                        </div>
                    )}

                    <p className="mt-12 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
                        &copy; 2026 SAATHIGROW • SECURITY HUB
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .scale-in-center { animation: scaleIn 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                @keyframes scaleIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}} />
        </div>
    );
};

export default ResetPassword;
