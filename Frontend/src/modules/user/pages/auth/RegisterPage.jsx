import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
    const { openRegister, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            navigate(redirectPath, { replace: true });
        } else {
            openRegister();
        }
    }, [user, navigate, redirectPath, openRegister]);

    return (
        <div className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-slate-900">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 bg-slate-900"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 z-0"></div>
        </div>
    );
};

export default RegisterPage;
