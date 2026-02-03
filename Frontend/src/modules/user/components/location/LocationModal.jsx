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
        <div className="fixed inset-0 z-[100] flex justify-center pt-[70px] px-4 pointer-events-none">
            {/* Darkened Overlay */}
            <div
                className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity"
                onClick={closeLocationModal}
            ></div>

            {/* Modal Box */}
            <div className="bg-white dark:bg-[#141414] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none w-full max-w-[750px] relative z-10 overflow-hidden animate-in slide-in-from-top-4 duration-300 pointer-events-auto p-8 border border-gray-100 dark:border-white/5 h-fit">
                <button
                    onClick={closeLocationModal}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-left">Change Location</h2>

                    {/* blinkit-style input row */}
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-2">
                        {/* Detect Location Button */}
                        <button
                            onClick={handleDetectLocation}
                            className="w-full md:w-auto bg-[#0c831f] text-white px-8 py-3 rounded-lg hover:bg-[#0b721b] transition-colors font-bold text-sm h-[48px] whitespace-nowrap shadow-sm active:scale-95"
                        >
                            {detecting ? 'Detecting...' : 'Detect my location'}
                        </button>

                        {/* OR Divider */}
                        <div className="relative flex items-center justify-center w-full md:w-24 h-10">
                            <div className="absolute w-full h-[1px] bg-gray-200 dark:bg-gray-800"></div>
                            <div className="relative w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] flex items-center justify-center shrink-0 z-10">
                                <span className="text-[11px] text-gray-400 font-bold">OR</span>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:flex-1 relative h-[48px]">
                            <input
                                type="text"
                                placeholder="search delivery location"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full h-full pl-4 pr-10 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#0c831f] dark:focus:border-[#0c831f] transition-colors placeholder:text-gray-400 text-gray-700 dark:text-white text-sm bg-transparent"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Area */}
                    {(searchText.length > 0 || suggestions.length > 0) && (
                        <div className="mt-6 max-h-[300px] overflow-y-auto pr-1">
                            {suggestions.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleManualSelect(city)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group border-b border-gray-50 dark:border-white/5 last:border-0"
                                >
                                    <MapPin size={18} className="text-gray-400 group-hover:text-[#0c831f]" />
                                    <span className="text-base text-gray-700 dark:text-gray-200 font-medium">{city}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
