import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStoreManagerAuth } from '../../context/StoreManagerAuthContext';
import { Store, Eye, EyeOff, Lock, Mail, Loader2, ArrowRight, Zap } from 'lucide-react';

const StoreManagerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { managerLogin } = useStoreManagerAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Key complexity insufficient (Min 6 chars)');
      return;
    }

    setLoading(true);

    try {
      await managerLogin(email, password);
      navigate('/store-manager/dashboard');
    } catch (err) {
      setError(err.message || 'Access Denied: Invalid security credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 relative">
        
        {/* Visual Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-500"></div>

        {/* Login Form Section */}
        <div className="p-10 w-full">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Store className="text-white" size={38} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter uppercase tracking-widest leading-none">Manager <span className="text-emerald-600">Portal</span></h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 px-6 leading-relaxed">Network Hub Terminal • v2.4.0</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-[10px] rounded-2xl border border-rose-100 text-center font-black uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Manager ID (Email)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 transition-colors group-focus-within:text-emerald-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm shadow-sm"
                  placeholder="manager@saathigrow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-300 transition-colors group-focus-within:text-emerald-500">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-14 pr-14 py-4 bg-gray-50 border-transparent border-2 rounded-2xl font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer appearance-none w-4 h-4 rounded-lg border-2 border-gray-200 checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer" />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity left-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className="ml-2 group-hover:text-emerald-600 transition-colors">Remember Session</span>
              </label>
              <Link to="/store-manager/forgot-password" size="sm" className="text-[10px] font-black text-emerald-600 hover:text-black uppercase tracking-widest transition-colors">Recover Key?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-5 px-6 rounded-2xl shadow-xl shadow-emerald-100 text-xs font-black uppercase tracking-[0.2em] text-white bg-emerald-600 hover:bg-black transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
            >
              {loading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  Initialize Sync <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <Zap size={10} className="text-emerald-400" /> Operational Readiness: 100%
            </div>
            <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
              &copy; 2026 SAATHIGROW • BRANCH NETWORK SECURED
            </p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; animation-iteration-count: 3; }
      `}} />
    </div>
  );
};

export default StoreManagerLogin;
