import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Mail, Bike, Hash, ArrowRight, Zap, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { registerDeliveryPartner } from '../api/deliveryAuthApi';

const VEHICLE_TYPES = ['Bike', 'EV', 'Cycle', 'Other'];

const DeliverySignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-10 max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[#028A0F]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-sm text-gray-500 font-medium mb-2">
            Hi <span className="font-bold text-gray-800">{form.name}</span>, your application is under review.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            Our team will verify your details and activate your account within 24 hours. You'll be able to log in once approved.
          </p>
          <button
            onClick={() => navigate('/delivery/login')}
            className="w-full py-3.5 bg-black text-white font-black rounded-2xl hover:bg-gray-900 active:scale-95 transition-all text-sm"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#028A0F] rounded-3xl flex items-center justify-center shadow-lg shadow-[#028A0F]/20">
            <Zap size={40} className="text-white fill-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
          Saathi<span className="text-[#028A0F]">Gro</span> Delivery
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Join our delivery fleet — fill in your details below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl shadow-gray-200/50 rounded-3xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Raju Kumar"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-[#028A0F] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Mobile Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="9876543210"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-[#028A0F] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Email <span className="normal-case font-medium text-gray-300">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="raju@example.com"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-[#028A0F] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
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
                        : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Vehicle Number <span className="normal-case font-medium text-gray-300">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input
                  name="vehicleNumber"
                  type="text"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                  placeholder="MP09-AB-1234"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:border-[#028A0F] focus:bg-white transition-all uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg text-sm font-black text-white bg-black hover:bg-gray-900 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Submit Application <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/delivery/login')}
              className="text-[#028A0F] font-black hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliverySignup;
