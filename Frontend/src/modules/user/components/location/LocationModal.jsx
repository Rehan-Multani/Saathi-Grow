import React, { useState } from 'react';
import { X, MapPin, Navigation, Search } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const LocationModal = () => {
    const { showLocationModal, closeLocationModal, updateLocation } = useLocation();
    const [searchText, setSearchText] = useState('');
    const [detecting, setDetecting] = useState(false);

    if (!showLocationModal) return null;

    const handleDetectLocation = () => {
        setDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Mock Reverse Geocoding
                    setTimeout(() => {
                        updateLocation({
                            address: '123, Green Street, Civil Lines',
                            city: 'Current Location'
                        });
                        setDetecting(false);
                    }, 1000);
                },
                (error) => {
                    alert('Unable to retrieve your location');
                    setDetecting(false);
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
            setDetecting(false);
        }
    };

    const handleManualSelect = (city) => {
        updateLocation({
            address: `${city}, India`,
            city: city
        });
    };

    const suggestions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Bhopal', 'Chandigarh', 'Noida', 'Gurgaon'].filter(
        city => city.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={closeLocationModal}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={closeLocationModal}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Location</h2>

                    {/* Detect Location Button */}
                    <button
                        onClick={handleDetectLocation}
                        className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition-colors mb-6 group"
                    >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--saathi-green)] shadow-sm group-hover:scale-110 transition-transform">
                            <Navigation size={20} className={detecting ? "animate-spin" : ""} />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold text-[var(--saathi-green)]">
                                {detecting ? 'Detecting...' : 'Detect my location'}
                            </span>
                            <span className="block text-xs text-gray-500">Using GPS</span>
                        </div>
                    </button>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search for area, street name..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--saathi-green)]/20 focus:border-[var(--saathi-green)] transition-all"
                        />
                    </div>

                    {/* Suggestions */}
                    <div className="max-h-48 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Saved Addresses & Suggestions</h3>
                        {/* Always show what user is typing as an option if it has length */}
                        {searchText.trim().length > 0 && !suggestions.includes(searchText) && (
                            <button
                                onClick={() => handleManualSelect(searchText)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors border-b border-gray-50 last:border-0"
                            >
                                <MapPin size={18} className="text-[#0c831f]" />
                                <span className="text-sm text-gray-700 font-medium">Use "{searchText}"</span>
                            </button>
                        )}
                        {suggestions.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleManualSelect(city)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0"
                            >
                                <MapPin size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-700 font-medium">{city}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
