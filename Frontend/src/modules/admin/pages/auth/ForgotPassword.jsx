import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Loader2, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/forgot-password`, { email, portal: 'admin' });
            setSubmitted(true);
            toast.success('Reset link dispatched to your email');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to dispatch reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 relative">
                
                <div className="p-10 w-full text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 transform -rotate-6">
                            <Zap className="text-white" size={38} />
                        </div>
                    </div>

                    {!submitted ? (
                        <>
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter uppercase tracking-widest leading-none">Recover <span className="text-blue-600">Access</span></h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Enter your email to receive recovery link</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Registered Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 transition-colors group-focus-within:text-blue-500">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm shadow-sm"
                                            placeholder="manager@saathigrow.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                            Submit Protocol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
                            <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tight">Transmission Successful</h3>
                            <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
                                A recovery link has been dispatched to <span className="text-blue-600 font-black">{email}</span>. Please verify your inbox.
                            </p>
                            <button 
                                onClick={() => navigate('/admin/login')}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
                            >
                                Back to Terminal
                            </button>
                        </div>
                    )}

                    <div className="mt-12 flex justify-center">
                        <Link to="/admin/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                            <ArrowLeft size={14} /> System Login
                        </Link>
                    </div>

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

export default ForgotPassword;
