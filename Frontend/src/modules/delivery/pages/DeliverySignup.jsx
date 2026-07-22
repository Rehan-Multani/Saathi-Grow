import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Mail, Bike, Hash, ArrowRight, Zap, CheckCircle, Upload, IdCard, FileText, Car, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { registerDeliveryPartner } from '../api/deliveryAuthApi';
import PolicyViewerModal from '../../../common/components/legal/PolicyViewerModal';

const VEHICLE_TYPES = ['Bike', 'EV', 'Cycle', 'Other'];

const DocUploadField = ({ label, required, file, preview, onChange, hint, icon }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
      {label}{' '}
      {required ? <span className="text-rose-500">*</span> : (
        <span className="normal-case font-medium text-gray-300 dark:text-gray-600">(optional)</span>
      )}
    </label>
    <label className="flex items-center gap-3 w-full p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/40 cursor-pointer hover:border-[#028A0F]/50 transition-all">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#028A0F]">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">
          {file ? file.name : 'Tap to upload image'}
        </p>
        <p className="text-[10px] text-slate-400 font-medium">{hint || 'JPG / PNG, max 10MB'}</p>
      </div>
      <Upload size={16} className="text-slate-400 shrink-0" />
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  </div>
);

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
    city: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
  });
  const [docs, setDocs] = useState({ aadhar: null, license: null, rc: null });
  const [docPreviews, setDocPreviews] = useState({ aadhar: null, license: null, rc: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocChange = (key) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setDocs((prev) => ({ ...prev, [key]: file }));
    setDocPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your full name');
    if (form.phone.length !== 10) return toast.error('Enter a valid 10-digit phone number');
    if (!form.city.trim()) return toast.error('Please enter your base city / location');
    if (!form.vehicleType) return toast.error('Please select a vehicle type');

    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!form.vehicleNumber.trim()) {
      return toast.error('Please enter your vehicle number');
    }
    if (!vehicleRegex.test(form.vehicleNumber)) {
      return toast.error('Vehicle number must be in format: 2 Letters, 2 Digits, 2 Letters, 4 Digits (e.g. MP09AB1234)');
    }

    if (!docs.aadhar) return toast.error('Please upload your Aadhar card');
    if (!docs.license) return toast.error('Please upload your Driving License');
    if (!agreedToTerms) return toast.error('Please agree to the Terms & Conditions and Privacy Policy');

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('phone', form.phone);
      if (form.email) data.append('email', form.email);
      data.append('city', form.city.trim());
      data.append('vehicleType', form.vehicleType);
      data.append('vehicleNumber', form.vehicleNumber);
      data.append('aadhar', docs.aadhar);
      data.append('license', docs.license);
      if (docs.rc) data.append('rc', docs.rc);

      await registerDeliveryPartner(data);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Our team will verify your details and documents and activate your account within 24 hours.
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
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <User size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your full name" className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Phone size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input name="phone" type="tel" required maxLength={10} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit mobile number" className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Email <span className="normal-case font-medium text-gray-300 dark:text-gray-600">(optional)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Base City / Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <MapPin size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input name="city" type="text" required value={form.city} onChange={handleChange} placeholder="e.g. Udaipur, RJ" className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Vehicle Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Bike size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <select name="vehicleType" required value={form.vehicleType} onChange={handleChange} className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none appearance-none">
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                Vehicle Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Hash size={17} className="text-gray-400 group-focus-within:text-[#028A0F] transition-colors" />
                </div>
                <input name="vehicleNumber" type="text" required maxLength={10} value={form.vehicleNumber} onChange={(e) => setForm((p) => ({ ...p, vehicleNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() }))} placeholder="MP09AB1234" className="block w-full pl-11 pr-4 py-4 rounded-2xl font-bold transition-all delivery-input outline-none uppercase tracking-widest" />
              </div>
            </div>

            <div className="pt-2 space-y-4 border-t border-slate-100 dark:border-zinc-800">
              <p className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-widest px-1 pt-3">Identity Documents</p>
              <DocUploadField label="Aadhar Card" required file={docs.aadhar} preview={docPreviews.aadhar} onChange={handleDocChange('aadhar')} icon={<IdCard size={20} />} />
              <DocUploadField label="Driving License" required file={docs.license} preview={docPreviews.license} onChange={handleDocChange('license')} icon={<FileText size={20} />} />
              <DocUploadField label="RC Card" file={docs.rc} preview={docPreviews.rc} onChange={handleDocChange('rc')} icon={<Car size={20} />} hint="Optional — vehicle registration certificate" />
            </div>

            <div className="flex items-start gap-2 mt-4 px-1">
              <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 text-[#028A0F] border-gray-300 rounded focus:ring-[#028A0F] cursor-pointer" />
              <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                I agree to the{' '}
                <button type="button" onClick={() => setViewPolicy({ isOpen: true, slug: 'terms-and-conditions', title: 'Terms and Conditions' })} className="text-[#028A0F] font-bold hover:underline">Terms & Conditions</button>
                {' '}and{' '}
                <button type="button" onClick={() => setViewPolicy({ isOpen: true, slug: 'privacy-policy', title: 'Privacy Policy' })} className="text-[#028A0F] font-bold hover:underline">Privacy Policy</button>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-lg text-sm font-black text-white dark:text-black bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none transition-all transform active:scale-95 disabled:opacity-50 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" /> : <>Submit Application <ArrowRight size={18} className="ml-2" /></>}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <button onClick={() => navigate('/delivery/login')} className="text-[#028A0F] font-black hover:underline">Login here</button>
          </p>
        </div>
      </div>

      <PolicyViewerModal isOpen={viewPolicy.isOpen} onClose={() => setViewPolicy({ isOpen: false, slug: '', title: '' })} policySlug={viewPolicy.slug} audience="Delivery Partner" title={viewPolicy.title} />

      <style>{`
        .delivery-input { color: #0f172a !important; background-color: #f8fafc !important; border: 1.5px solid #cbd5e1 !important; border-radius: 1rem !important; }
        .delivery-input::placeholder { color: #94a3b8 !important; opacity: 1 !important; }
        .delivery-input:focus { background-color: #ffffff !important; border-color: #028A0F !important; box-shadow: 0 0 0 1px #028A0F !important; }
        .dark .delivery-input { color: #ffffff !important; background-color: #0f172a !important; border-color: #334155 !important; }
        .dark .delivery-input::placeholder { color: #64748b !important; opacity: 1 !important; }
        .dark .delivery-input:focus { background-color: #0f172a !important; border-color: #028A0F !important; }
      `}</style>
    </div>
  );
};

export default DeliverySignup;
