import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Check, Home, Briefcase, Heart } from 'lucide-react';
import { useLocation as useAppLocation } from '../../context/LocationContext';

const AddressFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const { savedAddresses, addAddress, editAddress } = useAppLocation();

    const isEditMode = !!id;
    const [formData, setFormData] = useState({
        type: 'Home',
        address: '',
        city: '',
        isDefault: false,
        name: '',
        phone: ''
    });

    useEffect(() => {
        if (isEditMode) {
            const addressToEdit = savedAddresses.find(addr => addr.id === parseInt(id));
            if (addressToEdit) {
                setFormData({
                    ...addressToEdit,
                    name: addressToEdit.name || '',
                    phone: addressToEdit.phone || ''
                });
            }
        }
    }, [id, isEditMode, savedAddresses]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            editAddress(parseInt(id), formData);
        } else {
            addAddress(formData);
        }
        navigate('/saved-addresses');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addressTypes = [
        { id: 'Home', icon: Home, label: 'Home' },
        { id: 'Office', icon: Briefcase, label: 'Work' },
        { id: 'Other', icon: Heart, label: 'Other' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-[10px] z-10 border-b border-gray-50 dark:border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="!text-[14px] font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {isEditMode ? 'Edit Address' : 'Add New Address'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Address Type Selection */}
                <div>
                    <label className="!text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Save address as</label>
                    <div className="flex gap-3">
                        {addressTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type.id })}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${formData.type === type.id
                                        ? 'bg-[#0c831f] border-[#0c831f] text-white shadow-lg shadow-green-500/20'
                                        : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <type.icon size={14} />
                                <span className="!text-[11px] font-bold">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                    <label className="!text-[9px] font-black text-gray-400 uppercase tracking-widest block">Personal Details</label>
                    <div className="relative group">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" />
                        <input
                            required
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-[#0c831f] focus:bg-white dark:focus:bg-black transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" />
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="Mobile Number"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-[#0c831f] focus:bg-white dark:focus:bg-black transition-all"
                        />
                    </div>
                </div>

                {/* Address Details */}
                <div className="space-y-4">
                    <label className="!text-[9px] font-black text-gray-400 uppercase tracking-widest block">Address Details</label>
                    <div className="relative group">
                        <MapPin size={14} className="absolute left-3.5 top-4 text-gray-400 group-focus-within:text-[#0c831f] transition-colors" />
                        <textarea
                            required
                            name="address"
                            placeholder="Full Address (House No, Building, Street)"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-[#0c831f] focus:bg-white dark:focus:bg-black transition-all resize-none"
                        />
                    </div>
                    <input
                        required
                        type="text"
                        name="city"
                        placeholder="City, Pincode"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl !text-[12px] font-bold focus:outline-none focus:ring-1 focus:ring-[#0c831f] focus:bg-white dark:focus:bg-black transition-all"
                    />
                </div>

                {/* Default Toggle */}
                <div className="flex items-center justify-between p-1">
                    <div>
                        <h4 className="!text-[11px] font-black text-gray-800 dark:text-gray-100">Set as default</h4>
                        <p className="!text-[8px] text-gray-400 font-bold uppercase tracking-tight">Make this your primary delivery address</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0c831f]"></div>
                    </label>
                </div>

                {/* Save Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 z-20">
                    <button
                        type="submit"
                        className="w-full bg-[#0c831f] hover:bg-[#0a6b19] text-white font-black !text-[12px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddressFormPage;
