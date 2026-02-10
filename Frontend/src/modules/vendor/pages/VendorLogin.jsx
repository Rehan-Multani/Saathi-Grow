import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';

const VendorLogin = () => {
    const navigate = useNavigate();
    const { login } = useVendor();
    const [email, setEmail] = useState('vendor@saathigro.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        // Validate with stored password
        const isValid = login(email, password);

        if (isValid) {
            navigate('/vendor/dashboard');
        } else {
            setError('Invalid password! Please try again.');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Background Image - Visible mainly on desktop */}
            <div className="absolute inset-0 z-0 hidden md:block">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3"
                    alt="Groceries"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            {/* Content Container - Full screen on mobile, Card on desktop */}
            <div className="relative z-10 w-full md:max-w-md bg-white md:rounded-2xl md:shadow-2xl md:border md:border-white/10 overflow-hidden min-h-screen md:min-h-0 flex flex-col justify-center">
                <div className="p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-[#ebf7ed] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform -rotate-3">
                            <Store size={32} className="text-[#0c831f]" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Vendor Login</h1>
                        <p className="text-gray-500 text-sm">Welcome back! Manage your store.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 ml-1">Email or Phone</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-medium"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:border-[#0c831f] focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 animate-in slide-in-from-top">
                                <AlertCircle size={18} />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="remember" className="rounded text-[#0c831f] focus:ring-[#0c831f]" />
                                <label htmlFor="remember" className="text-gray-600 font-medium cursor-pointer">Remember me</label>
                            </div>
                            <button type="button" className="text-[#0c831f] font-bold hover:underline">Forgot password?</button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#0a6b19] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Login to Dashboard <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have a specific store? <br />
                            <button onClick={() => navigate('/vendor/register')} className="text-[#0c831f] font-bold hover:underline mt-1">Register New Store</button>
                        </p>
                    </div>
                </div>

                {/* Visual Bottom Bar (Desktop only) */}
                <div className="hidden md:block h-1.5 bg-gradient-to-r from-[#0c831f] via-[#f7cb15] to-[#0c831f]"></div>
            </div>
        </div>
    );
};

export default VendorLogin;
