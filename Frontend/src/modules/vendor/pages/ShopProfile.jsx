import React, { useState, useRef } from 'react';
import { Camera, Save, MapPin, Store, User, Phone, Mail, Clock, X, Check, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Navigation, Search, Globe } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { useNavigate } from 'react-router-dom';
import { loadGoogleMaps } from '../../../utils/googleMapsLoader';

const ShopProfile = () => {
    const navigate = useNavigate();
    const { vendor, updateVendorProfile, changePassword, logout } = useVendor();
    const [isEditing, setIsEditing] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const searchRef = React.useRef(null);
    const autocompleteRef = React.useRef(null);

    // Initial State
    const [formData, setFormData] = useState({
        storeName: vendor?.storeName || '',
        ownerName: vendor?.ownerName || '',
        phone: vendor?.phone || '',
        email: vendor?.email || '',
        address: vendor?.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: { type: 'Point', coordinates: [75.8577, 22.7196] }
        },
        description: vendor?.description || '',
        logo: vendor?.logo || ''
    });

    // Helper to format address for display
    const formatAddress = (addr) => {
        if (!addr) return 'Address not set';
        if (typeof addr === 'string') return addr;
        const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Address components missing';
    };

    // Google Maps Loader
    React.useEffect(() => {
        loadGoogleMaps()
            .then(() => setMapLoaded(true))
            .catch(err => console.error("Google Maps load failed", err));
    }, []);

    // Initialize Autocomplete
    React.useEffect(() => {
        if (mapLoaded && isEditing && searchRef.current && !autocompleteRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(searchRef.current, {
                componentRestrictions: { country: "IN" },
                fields: ["address_components", "geometry", "formatted_address"]
            });

            autocompleteRef.current.addListener("place_changed", () => {
                const place = autocompleteRef.current.getPlace();
                if (!place.geometry || !place.geometry.location) return;

                handlePlaceSelect(place);
            });
        }
    }, [mapLoaded, isEditing]);

    const handlePlaceSelect = (place) => {
        const components = place.address_components;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const getComponent = (types) => {
            return components.find(c => types.some(t => c.types.includes(t)))?.long_name || '';
        };

        const streetNumber = getComponent(['street_number']);
        const route = getComponent(['route']);
        const neighborhood = getComponent(['neighborhood', 'sublocality_level_1']);

        const street = `${streetNumber} ${route} ${neighborhood}`.trim() || place.formatted_address.split(',')[0];

        const newAddress = {
            street: street,
            city: getComponent(['locality']),
            state: getComponent(['administrative_area_level_1']),
            zipCode: getComponent(['postal_code']),
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            }
        };

        setFormData(prev => ({ ...prev, address: newAddress }));
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                if (window.google) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            handlePlaceSelect(results[0]);
                        }
                        setIsDetecting(false);
                    });
                } else {
                    setIsDetecting(false);
                }
            },
            (error) => {
                console.error(error);
                alert('Unable to detect location');
                setIsDetecting(false);
            }
        );
    };

    // Password change state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleSave = async () => {
        const success = await updateVendorProfile({
            storeName: formData.storeName,
            ownerName: formData.ownerName,
            address: formData.address,
            description: formData.description
        });
        if (success) {
            setIsEditing(false);
            autocompleteRef.current = null;
        }
    };

    const handleCancel = () => {
        // Reset form to vendor values
        setFormData({
            storeName: vendor?.storeName || '',
            ownerName: vendor?.ownerName || '',
            phone: vendor?.phone || '',
            email: vendor?.email || '',
            address: vendor?.address || {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                location: { type: 'Point', coordinates: [75.8577, 22.7196] }
            },
            description: vendor?.description || '',
            logo: vendor?.logo || ''
        });
        setIsEditing(false);
        autocompleteRef.current = null;
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        // Validation
        if (!passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Password fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        const success = await updateVendorProfile({ password: passwordData.newPassword });

        if (success) {
            setPasswordSuccess(true);
            setPasswordData({
                newPassword: '',
                confirmPassword: ''
            });

            setTimeout(() => {
                logout();
                navigate('/vendor/login');
            }, 3000);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const uploadData = new FormData();
            uploadData.append('logo', file);
            await updateVendorProfile(uploadData);
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
                                <img src={formData.logo || 'https://via.placeholder.com/150'} alt="Store" className="w-full h-full object-cover" />
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
                                onChange={handleLogoUpload}
                            />
                        </div>

                        <div className="flex-1 w-full md:w-auto text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-1 md:mb-0">{formData.storeName}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 mt-1">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1 ${vendor?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                    {vendor?.status === 'Active' && <CheckCircle size={12} />} {vendor?.status}
                                </span>
                                <span className="font-mono text-xs">#{vendor?._id?.substring(vendor._id.length - 8)}</span>
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
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><User size={12} /> Owner Name</label>
                                <input
                                    disabled={!isEditing}
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1">Description</label>
                                <textarea
                                    disabled={!isEditing}
                                    name="description"
                                    value={formData.description}
                                    rows={2}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors resize-none ${isEditing ? 'border-gray-300 focus:border-[#0c831f] bg-white' : 'border-transparent bg-transparent pl-0'}`}
                                />
                            </div>
                        </div>

                        {/* Section 2: Contact Info */}
                        <div className="space-y-4 lg:space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Contact Information</h3>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Phone size={12} /> Mobile Number</label>
                                <input
                                    disabled={true}
                                    name="phone"
                                    value={formData.phone}
                                    className="w-full px-3 py-2 border-transparent bg-transparent text-sm font-medium outline-none pl-0 opacity-70"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Mail size={12} /> Email Address</label>
                                <input
                                    disabled={true}
                                    name="email"
                                    value={formData.email}
                                    className="w-full px-3 py-2 border-transparent bg-transparent text-sm font-medium outline-none pl-0 opacity-70"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin size={12} /> Store Address</label>

                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={14} />
                                                <input
                                                    ref={searchRef}
                                                    type="text"
                                                    placeholder="Search location on map..."
                                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none bg-white shadow-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={detectLocation}
                                                disabled={isDetecting}
                                                className="px-3 py-2 bg-green-50 text-[#0c831f] border border-green-100 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm whitespace-nowrap active:scale-95"
                                            >
                                                <Navigation size={14} className={isDetecting ? "animate-pulse" : ""} />
                                                {isDetecting ? '...' : 'Live Location'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2">
                                                <input
                                                    type="text"
                                                    placeholder="Street / Area / Landmark"
                                                    value={formData.address.street}
                                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={formData.address.city}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Zip Code"
                                                value={formData.address.zipCode}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:border-[#0c831f] outline-none"
                                                value={formData.address.state}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <p className="text-sm font-medium text-gray-900 leading-relaxed max-w-sm">
                                            {formatAddress(formData.address)}
                                        </p>
                                        {formData.address.location?.coordinates && (
                                            <a
                                                href={`https://www.google.com/maps?q=${formData.address.location.coordinates[1]},${formData.address.location.coordinates[0]}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-flex items-center gap-1.5 text-[#0c831f] text-[10px] font-bold hover:underline"
                                            >
                                                <Globe size={10} /> View on Google Maps
                                            </a>
                                        )}
                                    </div>
                                )}
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
