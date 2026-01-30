import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    return (
        <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300 relative z-10">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                        <p className="text-gray-500 text-sm">Join SaathiGro for the freshest groceries.</p>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[var(--saathi-green)] focus:ring-1 focus:ring-[var(--saathi-green)] outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" placeholder="+91" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[var(--saathi-green)] focus:ring-1 focus:ring-[var(--saathi-green)] outline-none transition" />
                        </div>

                        <button type="button" className="w-full bg-[var(--saathi-green)] text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-100">
                            Register
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-[var(--saathi-green)] font-bold hover:underline">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
