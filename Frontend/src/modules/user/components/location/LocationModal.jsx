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
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Change Location</h2>

                    {/* blinkit-style input row */}
                    <div className="flex flex-row items-center gap-4 mb-6">
                        {/* Detect Location Button */}
                        <button
                            onClick={handleDetectLocation}
                            className="flex-none bg-[#0c831f] text-white px-6 py-2.5 rounded-full hover:bg-[#0b721b] transition-colors font-semibold text-sm h-[42px] whitespace-nowrap"
                        >
                            Detect my location
                        </button>

                        {/* OR Divider */}
                        <div className="flex-none flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                                <span className="text-[10px] text-gray-400 font-bold">OR</span>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="flex-grow relative h-[42px]">
                            <input
                                type="text"
                                placeholder="search delivery location"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full h-full pl-4 pr-10 border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#0c831f] transition-colors placeholder:text-gray-400 text-gray-700 text-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Area */}
                    {(searchText.length > 0 || suggestions.length > 0) && (
                        <div className="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                            {searchText.length === 0 && (
                                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 text-left">Popular Cities</h3>
                            )}

                            {searchText.trim().length > 0 && !suggestions.map(s => s.toLowerCase()).includes(searchText.toLowerCase()) && (
                                <button
                                    onClick={() => handleManualSelect(searchText)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group mb-1"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <MapPin size={16} className="text-gray-500 group-hover:text-[var(--saathi-green)]" />
                                    </div>
                                    <div className="flex-grow text-left">
                                        <span className="block text-sm font-medium text-[var(--saathi-green)]">Enable "{searchText}"</span>
                                        <span className="block text-xs text-gray-400">Use this as your address</span>
                                    </div>
                                </button>
                            )}

                            {suggestions.map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleManualSelect(city)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group border-b border-gray-50 last:border-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <MapPin size={16} className="text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                    <span className="text-sm md:text-base text-gray-700 font-medium">{city}</span>
                                </button>
                            ))}

                            {suggestions.length === 0 && searchText.length > 0 && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-400">No matching locations found.</p>
                                </div>
                            )}
                        </div>
                    )
                    }
                </div >
            </div >
        </div >
    );
};

export default LocationModal;
