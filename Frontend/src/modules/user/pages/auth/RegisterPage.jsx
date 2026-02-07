import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';

    // Robust Redirection: Watch for user change
    React.useEffect(() => {
        if (user) {
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate, redirectPath]);

    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const handleRegister = (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) {
            alert('Enter a valid 10-digit phone number');
            return;
        }

        const result = register(formData);
        if (result.success) {
            navigate(redirectPath, { replace: true });
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="relative min-h-screen md:min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            <div className="bg-white dark:bg-black rounded-xl shadow-xl w-full max-w-[340px] overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300 relative z-10">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h1>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Join SaathiGro for the freshest groceries.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className="w-full px-3.5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all dark:text-white text-[13px] font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-1.5 px-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                maxLength="10"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                placeholder="98765 43210"
                                className="w-full px-3.5 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-xl focus:border-[#0c831f] focus:ring-1 focus:ring-[#0c831f] outline-none transition-all dark:text-white text-[13px] font-bold"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={formData.phone.length !== 10 || !formData.name}
                            style={{ borderRadius: '100px' }}
                            className="w-full bg-[#0c831f] text-white py-2.5 font-black text-xs hover:bg-green-700 transition-all shadow-lg shadow-green-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Register Account
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-[#0c831f] dark:text-[#10b981] font-bold hover:underline">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
