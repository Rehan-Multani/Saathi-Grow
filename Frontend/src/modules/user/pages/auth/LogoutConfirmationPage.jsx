import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';

const LogoutConfirmationPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white dark:bg-black rounded-3xl border border-gray-100 dark:border-white/5 p-8 text-center shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <ShieldAlert size={32} />
                </div>

                <h1 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Sign out of SaathiGro?</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                    You'll need to sign in again to access your orders, saved addresses, and profile settings.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleLogout}
                        style={{ borderRadius: '100px' }}
                        className="w-full bg-red-500 text-white py-3.5 font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Yes, Sign Out
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        style={{ borderRadius: '100px' }}
                        className="w-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white py-3.5 font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmationPage;
