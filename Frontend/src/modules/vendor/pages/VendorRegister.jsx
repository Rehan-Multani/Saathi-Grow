import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowRight, CheckCircle, MapPin, Mail, Lock, Phone, User, Navigation, Search } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { loadGoogleMaps } from '../../../utils/googleMapsLoader';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import PolicyViewerModal from '../../../common/components/legal/PolicyViewerModal';
const VendorRegister = () => {
    const navigate = useNavigate();
    const { register, loading } = useVendor();

    const [mapLoaded, setMapLoaded] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [viewPolicy, setViewPolicy] = useState({ isOpen: false, slug: '', title: '' });
    const searchRef = React.useRef(null);
    const autocompleteRef = React.useRef(null);

    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        storeName: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            location: { type: 'Point', coordinates: [75.8577, 22.7196] }
        },
        description: ''
    });

    // Google Maps Loader
    React.useEffect(() => {
        loadGoogleMaps()
            .then(() => setMapLoaded(true))
            .catch(err => console.error("Google Maps load failed", err));
    }, []);

    // Initialize Autocomplete
    React.useEffect(() => {
        if (mapLoaded && searchRef.current && !autocompleteRef.current) {
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
    }, [mapLoaded]);

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

        setFormData(prev => ({
            ...prev,
            address: {
                street: street,
                city: getComponent(['locality']),
                state: getComponent(['administrative_area_level_1']),
                zipCode: getComponent(['postal_code']),
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            }
        }));
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'ownerName') {
            const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else if (name === 'phone') {
            const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanedValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreedToTerms) {
            return toast.error('Please agree to the Terms & Conditions and Privacy Policy');
        }
        const success = await register(formData);
        if (success) {
            navigate('/vendor/login');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0 hidden md:block">
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574"
                    alt="Groceries"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 w-full md:max-w-2xl bg-white md:rounded-2xl md:shadow-2xl md:border md:border-white/10 overflow-hidden flex flex-col">
                <div className="p-6 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Register Your Store</h1>
                        <p className="text-gray-500 text-sm mt-1">Join saathigro and start selling online.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Owner Name</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                    <User size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                    <input name="ownerName" required onChange={handleChange} value={formData.ownerName} type="text" className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" placeholder="Rahul Kumar" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Email Address</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                    <Mail size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                    <input name="email" required onChange={handleChange} value={formData.email} type="email" className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" placeholder="rahul@example.com" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Mobile Number</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                    <Phone size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                    <input name="phone" required onChange={handleChange} value={formData.phone} maxLength={10} type="tel" className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" placeholder="10-digit mobile number" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Password</label>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                    <Lock size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                    <input name="password" required onChange={handleChange} value={formData.password} type="password" minLength={6} className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700">Store Name</label>
                            <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                                <Store size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                <input name="storeName" required onChange={handleChange} value={formData.storeName} type="text" className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400" placeholder="Fresh Mart Details" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                <MapPin size={14} /> Store Address
                            </label>

                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus-within:border-[#0c831f] focus-within:bg-white transition-colors flex-1">
                                    <Search size={15} className="text-gray-400 shrink-0 min-w-[15px]" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        placeholder="Search your store location..."
                                        className="flex-1 min-w-0 bg-transparent outline-none plain-input text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={isDetecting}
                                    className="px-4 py-2 bg-green-50 text-[#0c831f] border border-green-100 rounded-xl hover:bg-green-100 transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap active:scale-95"
                                >
                                    <Navigation size={14} className={isDetecting ? "animate-pulse" : ""} />
                                    {isDetecting ? 'Detecting...' : 'Live Location'}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="col-span-2">
                                    <input
                                        name="address_street"
                                        required
                                        placeholder="Street / Area / Landmark"
                                        value={formData.address.street}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                            setFormData({ ...formData, address: { ...formData.address, street: val } });
                                        }}
                                        className="w-full px-4 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium"
                                    />
                                </div>
                                <input
                                    name="address_city"
                                    required
                                    placeholder="City"
                                    value={formData.address.city}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                        setFormData({ ...formData, address: { ...formData.address, city: val } });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium"
                                />
                                <input
                                    name="address_zip"
                                    required
                                    placeholder="Zip Code"
                                    value={formData.address.zipCode}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                    className="w-full px-4 py-2 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-700 ml-1">Description (Optional)</label>
                            <textarea name="description" onChange={handleChange} value={formData.description} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#0c831f] outline-none text-sm font-medium resize-none" placeholder="Tell us about your store..." />
                        </div>

                        <div className="flex items-start gap-2 mt-2 px-1">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 text-[#0c831f] border-gray-300 rounded focus:ring-[#0c831f] cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs text-gray-500 font-medium leading-tight">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={() => setViewPolicy({ isOpen: true, slug: 'terms-and-conditions', title: 'Terms and Conditions' })}
                                    className="text-[#0c831f] font-bold hover:underline"
                                >
                                    Terms & Conditions
                                </button>
                                {' '}and{' '}
                                <button
                                    type="button"
                                    onClick={() => setViewPolicy({ isOpen: true, slug: 'privacy-policy', title: 'Privacy Policy' })}
                                    className="text-[#0c831f] font-bold hover:underline"
                                >
                                    Privacy Policy
                                </button>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 bg-[#0c831f] text-white font-bold rounded-xl shadow-lg shadow-green-900/20 hover:bg-[#0a6b19] active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Register Store <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t pt-6">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account? <br />
                            <button onClick={() => navigate('/vendor/login')} className="text-[#0c831f] font-bold hover:underline mt-1">Login to your dashboard</button>
                        </p>
                    </div>
                </div>
            </div>

            <PolicyViewerModal
                isOpen={viewPolicy.isOpen}
                onClose={() => setViewPolicy({ isOpen: false, slug: '', title: '' })}
                policySlug={viewPolicy.slug}
                audience="Vendor"
                title={viewPolicy.title}
            />

            <style>{`
                input::-webkit-contacts-auto-fill-button,
                input::-webkit-credentials-auto-fill-button { visibility: hidden; pointer-events: none; }
            `}</style>
        </div>
    );
};

export default VendorRegister;

