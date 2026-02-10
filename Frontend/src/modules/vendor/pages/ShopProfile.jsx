import React, { useState } from 'react';
import { Camera, Save, MapPin, Store, User, Phone, Mail, Clock, X, Check, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { useNavigate } from 'react-router-dom';

const ShopProfile = () => {
    const navigate = useNavigate();
    const { vendor, updateVendorProfile, changePassword, logout } = useVendor();
    const [isEditing, setIsEditing] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        name: vendor.name,
        owner: vendor.owner,
        phone: vendor.phone || '+91 98765 43210',
        email: vendor.email || 'store@saathigro.com',
        address: vendor.address || '123, Main Market, Sector 18, Noida',
        category: 'Grocery & Staples',
        openingTime: '08:00 AM',
        closingTime: '10:00 PM',
        image: vendor.image
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleSave = () => {
        updateVendorProfile({
            name: formData.name,
            owner: formData.owner,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            image: formData.image
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        // Reset form to vendor values
        setFormData({
            name: vendor.name,
            owner: vendor.owner,
            phone: vendor.phone || '+91 98765 43210',
            email: vendor.email || 'store@saathigro.com',
            address: vendor.address || '123, Main Market, Sector 18, Noida',
            category: 'Grocery & Staples',
            openingTime: '08:00 AM',
            closingTime: '10:00 PM',
            image: vendor.image
        });
        setIsEditing(false);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        // Change password using context
        const result = changePassword(passwordData.currentPassword, passwordData.newPassword);

        if (result.success) {
            setPasswordSuccess(true);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Logout after 2 seconds to force re-login with new password
            setTimeout(() => {
                logout();
                navigate('/vendor/login');
            }, 2000);
        } else {
            setPasswordError(result.error);
        }
    };

    return (
        <div className="-mx-4 -my-4 md:mx-0 md:my-0"> {/* Negative margin to fill screen on mobile */}
            <div className="bg-white md:rounded-xl md:shadow-sm border-b md:border border-gray-100 overflow-hidden min-h-[calc(100vh-64px)] md:min-h-0 pb-20 md:pb-0">



                {/* Profile Info */}
                <div className="relative p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-28 lg:h-28 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
                                <img src={formData.image} alt="Store" className="w-full h-full object-cover" />
                            </div>
                            <button
                                onClick={() => document.getElementById('profile-image-upload').click()}
                                className="absolute bottom-0 right-0 p-1.5 bg-gray-900 text-white rounded-lg shadow-sm hover:bg-black transition-colors"
                            >
                                <Camera size={14} />
                            </button>
                            <input
                                type="file"
                                id="profile-image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({ ...prev, image: reader.result }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>

                        <div className="flex-1 w-full md:w-auto text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1 md:mb-0">{formData.name}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-1">
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100 flex items-center gap-1">
                                    <CheckCircle size={12} /> Verified Seller
                                </span>
                                <span>•</span>
                                <span>{formData.category}</span>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="w-full md:w-auto flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full md:w-auto px-4 py-2 bg-[#0c831f] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a6b19] shadow-sm transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 md:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 md:flex-none px-4 py-2 bg-[#0c831f] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a6b19] shadow-sm transition-colors"
                                    >
                                        <Check size={16} /> Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-6 mt-8 lg:mt-6">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4 lg:space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Basic Details</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Store size={12} /> Store Name</label>
                                <input
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><User size={12} /> Owner Name</label>
                                <input
                                    disabled={!isEditing}
                                    value={formData.owner}
                                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Clock size={12} /> Opening Hours</label>
                                <div className="flex gap-2">
                                    <input
                                        disabled={!isEditing}
                                        value={formData.openingTime}
                                        onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                    />
                                    <input
                                        disabled={!isEditing}
                                        value={formData.closingTime}
                                        onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Contact Info */}
                        <div className="space-y-4 lg:space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Contact Information</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Phone size={12} /> Mobile Number</label>
                                <input
                                    disabled={!isEditing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Mail size={12} /> Email Address</label>
                                <input
                                    disabled={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin size={12} /> Store Address</label>
                                <textarea
                                    rows="3"
                                    disabled={!isEditing}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors resize-none ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Security - Password Change */}
                    <div className="mt-8 lg:mt-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2 mb-4 lg:mb-3">Security Settings</h3>

                        {/* Success/Error Messages */}
                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 animate-in slide-in-from-top">
                                <CheckCircle size={18} />
                                <span className="text-sm font-bold">Password changed successfully!</span>
                            </div>
                        )}
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 animate-in slide-in-from-top">
                                <AlertCircle size={18} />
                                <span className="text-sm font-bold">{passwordError}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Current Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                    <Lock size={12} /> Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#0c831f] bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                    <Lock size={12} /> New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#0c831f] bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Min 6 characters</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                    <Lock size={12} /> Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Confirm new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:border-[#0c831f] bg-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button - Full Width on Mobile */}
                            <div className="md:col-span-3 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Lock size={16} />
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Bottom Action Bar (Also visible when editing for convenience) */}
                    {isEditing && (
                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3 animate-in slide-in-from-bottom duration-300">
                            <button onClick={handleCancel} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19] flex items-center gap-2 shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopProfile;
