import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Mail, Bike, Hash, ArrowRight, Zap, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { registerDeliveryPartner } from '../api/deliveryAuthApi';
import PolicyViewerModal from '../../../common/components/legal/PolicyViewerModal';

const VEHICLE_TYPES = ['Bike', 'EV', 'Cycle', 'Other'];

const DeliverySignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [viewPolicy, setViewPolicy] = useState({ isOpen: false, slug: '', title: '' });
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone.length !== 10) return toast.error('Enter a valid 10-digit phone number');
    
    // Vehicle Number Format Validation: 2 letters, 2 digits, 2 letters, 4 digits
    if (form.vehicleNumber) {
      const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
      if (!vehicleRegex.test(form.vehicleNumber)) {
        return toast.error('Vehicle number must be in format: 2 Letters, 2 Digits, 2 Letters, 4 Digits (e.g. MP09AB1234)');
      }
    }

    if (!agreedToTerms) return toast.error('Please agree to the Terms & Conditions and Privacy Policy');

    setLoading(true);
    try {
      await registerDeliveryPartner(form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center justify-center px-4 font-sans transition-colors duration-300">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 p-10 max-w-sm w-full text-center transition-all duration-300"
        >
          <div className="w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[#028A0F]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
            Hi <span className="font-bold text-gray-800 dark:text-gray-200">{form.name}</span>, your application is under review.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
            Our team will verify your details and activate your account within 24 hours. You'll be able to log in once approved.
          </p>
          <button
            onClick={() => navigate('/delivery/login')}
            className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:bg-gray-900 dark:hover:bg-gray-100 active:scale-95 transition-all text-sm"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col justify-center py-10 px-4 font-sans transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#028A0F] rounded-3xl flex items-center justify-center shadow-lg shadow-[#028A0F]/20">
            <Zap size={40} className="text-white fill-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Saathi<span className="text-[#028A0F]">Gro</span> Delivery
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
          Join our delivery fleet — fill in your details below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1e293b] py-8 px-6 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-3xl border border-gray-100 dark:border-white/5 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <User size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(val)) {
                      setForm((p) => ({ ...p, name: val }));
                    }
                  }}
                  placeholder="Raju Kumar"
                  className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Mobile Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Phone size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="9876543210"
                  className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none"
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Email <span className="normal-case font-medium text-gray-300 dark:text-gray-600">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="raju@example.com"
                  className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Vehicle Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, vehicleType: type }))}
                    className={`py-3 rounded-2xl text-xs font-black border-2 transition-all active:scale-95 ${
                      form.vehicleType === type
                        ? 'bg-[#028A0F] text-white border-[#028A0F] shadow-lg shadow-green-900/20'
                        : 'bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Vehicle Number <span className="normal-case font-medium text-gray-300 dark:text-gray-600">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Hash size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="vehicleNumber"
                  type="text"
                  maxLength={10}
                  value={form.vehicleNumber}
                  onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() }))}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  placeholder="MP09AB1234"
                  className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2 mt-4 px-1">
              <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#028A0F] border-gray-300 rounded focus:ring-[#028A0F] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                  I agree to the{' '}
                  <button 
                      type="button" 
                      onClick={() => setViewPolicy({ isOpen: true, slug: 'terms-and-conditions', title: 'Terms and Conditions' })}
                      className="text-[#028A0F] font-bold hover:underline"
                  >
                      Terms & Conditions
                  </button>
                  {' '}and{' '}
                  <button 
                      type="button" 
                      onClick={() => setViewPolicy({ isOpen: true, slug: 'privacy-policy', title: 'Privacy Policy' })}
                      className="text-[#028A0F] font-bold hover:underline"
                  >
                      Privacy Policy
                  </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg text-sm font-black text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Submit Application <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="mt-6 text-center flex flex-col gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/delivery/login')}
              className="text-[#028A0F] font-black hover:underline"
            >
              Login here
            </button>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Need help?{' '}
            <button
              onClick={() => navigate('/delivery/support')}
              className="text-[#028A0F] font-black hover:underline"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>

      <PolicyViewerModal 
          isOpen={viewPolicy.isOpen}
          onClose={() => setViewPolicy({ isOpen: false, slug: '', title: '' })}
          policySlug={viewPolicy.slug}
          audience="Delivery Partner"
          title={viewPolicy.title}
      />

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

export default DeliverySignup;
