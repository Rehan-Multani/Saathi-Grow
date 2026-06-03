import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, Store } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';
import { toast } from 'react-toastify';

const VendorForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/vendors/forgot-password`, { email });
            setSent(true);
            toast.success('Reset link sent to your email!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-[420px] px-10 py-10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#0c831f]/10 rounded-2xl flex items-center justify-center">
                        <Store size={32} className="text-[#0c831f]" />
                    </div>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                        <p className="text-sm text-gray-500">We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.</p>
                        <button onClick={() => navigate('/vendor/login')} className="w-full py-3 bg-[#0c831f] text-white font-bold rounded-2xl hover:bg-[#0a6b19] transition-all">
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                            <p className="text-sm text-gray-400 mt-1">Enter your registered email to receive a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Email Address</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                    <Mail size={15} className="text-gray-400 shrink-0" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="flex-1 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full py-3.5 bg-[#0c831f] text-white font-bold rounded-2xl hover:bg-[#0a6b19] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
                            </button>

                            <button type="button" onClick={() => navigate('/vendor/login')}
                                className="w-full py-2.5 text-sm font-bold text-gray-500 flex items-center justify-center gap-2 hover:text-gray-700 transition-colors">
                                <ArrowLeft size={15} /> Back to Login
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default VendorForgotPassword;
