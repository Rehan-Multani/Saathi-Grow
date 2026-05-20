import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import useDeliveryStore from '../store/deliveryStore';
import { requestOTP } from '../api/deliveryAuthApi';

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const { login, token, error: storeError } = useDeliveryStore();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (token) {
      navigate('/delivery/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) return toast.error('Enter valid 10-digit number');

    setLoading(true);
    try {
      await requestOTP(phone);
      toast.success('OTP sent to ' + phone);
      setStep(2);
      setTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');

    setLoading(true);
    const success = await login(phone, otp);
    if (success) {
      toast.success('Welcome back!');
      navigate('/delivery/dashboard');
    } else {
      toast.error(storeError || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#028A0F] rounded-3xl flex items-center justify-center shadow-lg shadow-[#028A0F]/20 rotation-12">
            <Zap size={40} className="text-white fill-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Saathi<span className="text-[#028A0F]">Gro</span> Delivery
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
          {step === 1 ? 'Enter phone number to get started' : 'Verify your identity to login'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1e293b] py-8 px-6 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-3xl border border-gray-100 dark:border-white/5 transition-all duration-300">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
                onSubmit={handleSendOTP}
              >
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Registered Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Phone size={18} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={10}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <button
                    disabled={loading || phone.length !== 10}
                    type="submit"
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Get OTP <ArrowRight size={18} className="ml-2" /></>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
                onSubmit={handleVerifyOTP}
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">OTP sent to <span className="font-bold text-gray-900 dark:text-white">+91 {phone}</span></p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#028A0F] hover:text-[#035a0a] underline mt-1"
                  >
                    Change Number
                  </button>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock size={18} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-11 pr-4 py-4 rounded-2xl text-center text-2xl tracking-[0.5em] font-black outline-none delivery-input"
                      placeholder="------"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    disabled={loading || otp.length !== 6}
                    type="submit"
                    className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={timer > 0 || loading}
                    onClick={handleSendOTP}
                    className="w-full py-2 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-gray-400 dark:text-gray-500">
          <ShieldCheck size={16} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Secure Rider Access Only</span>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            New rider?{' '}
            <button
              onClick={() => navigate('/delivery/signup')}
              className="text-[#028A0F] font-black hover:underline"
            >
              Apply to join
            </button>
          </p>
        </div>
      </div>

      {/* Bulletproof WebView Overlay Style Tag */}
      <style>{`
        .delivery-input {
          color: #0f172a !important;
          background-color: #f8fafc !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 1rem !important;
        }
        .delivery-input::placeholder {
          color: #94a3b8 !important;
          opacity: 1 !important;
        }
        .delivery-input:focus {
          background-color: #ffffff !important;
          border-color: #028A0F !important;
          box-shadow: 0 0 0 1px #028A0F !important;
        }
        
        /* Dynamic transition support for standard native dark-mode class */
        .dark .delivery-input {
          color: #ffffff !important;
          background-color: #0f172a !important;
          border-color: #334155 !important;
        }
        .dark .delivery-input::placeholder {
          color: #64748b !important;
          opacity: 1 !important;
        }
        .dark .delivery-input:focus {
          background-color: #0f172a !important;
          border-color: #028A0F !important;
        }
      `}</style>
    </div>
  );
};

export default DeliveryLogin;
