import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, Eye, EyeOff, Store } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/apiConfig';
import { toast } from 'react-toastify';

const VendorResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) return toast.error('Passwords do not match');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/vendors/reset-password/${token}`, { password });
            toast.success('Password reset successful!');
            navigate('/vendor/login');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Reset failed. Link may have expired.');
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
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                    <p className="text-sm text-gray-400 mt-1">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">New Password</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                            <Lock size={15} className="text-gray-400 shrink-0" />
                            <input type={showPass ? 'text' : 'password'} required value={password}
                                onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                className="flex-1 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" />
                            <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-gray-600 border-none bg-transparent p-0">
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Confirm Password</label>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-3 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                            <Lock size={15} className="text-gray-400 shrink-0" />
                            <input type={showPass ? 'text' : 'password'} required value={confirm}
                                onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                                className="flex-1 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-[#0c831f] text-white font-bold rounded-2xl hover:bg-[#0a6b19] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Reset Password</span><ArrowRight size={16} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VendorResetPassword;
