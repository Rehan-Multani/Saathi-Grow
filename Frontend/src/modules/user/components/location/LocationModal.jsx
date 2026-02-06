import React, { useState } from 'react';
import { X, MapPin, Navigation, Search } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const LocationModal = () => {
    const { showLocationModal, closeLocationModal, updateLocation, savedAddresses } = useLocation();
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

    const handleAddressSelect = (addr) => {
        updateLocation({
            address: addr.address,
            city: addr.city
        });
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
        <div className="fixed inset-0 z-[100] flex justify-center md:pt-[70px] px-0 md:px-4 pointer-events-none">
            {/* Darkened Overlay */}
            <div
                className="absolute inset-0 bg-white dark:bg-black md:bg-black/50 pointer-events-auto transition-opacity"
                onClick={closeLocationModal}
            ></div>

            {/* Modal Box */}
            <div className="bg-white dark:bg-[#141414] md:rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none w-full max-w-[550px] relative z-10 overflow-hidden animate-in md:slide-in-from-top-4 slide-in-from-bottom-full duration-300 pointer-events-auto p-5 md:p-6 border-0 md:border md:border-gray-100 md:dark:border-white/5 h-full md:h-fit max-h-[90vh] flex flex-col">
                <button
                    onClick={closeLocationModal}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors md:flex"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="flex flex-col h-full overflow-hidden">
                    <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 mb-6 text-left tracking-tight">Select Delivery Location</h2>

                    {/* blinkit-style input row */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4 shrink-0">
                        {/* Detect Location Button */}
                        <button
                            onClick={handleDetectLocation}
                            className="w-full md:w-auto bg-[#0c831f] text-white px-6 py-2.5 rounded-lg hover:bg-[#0b721b] transition-colors font-bold text-xs md:text-sm h-[42px] whitespace-nowrap shadow-sm active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Navigation size={14} fill="currentColor" />
                            {detecting ? 'Detecting...' : 'Detect location'}
                        </button>

                        {/* Search Input */}
                        <div className="w-full md:flex-1 relative h-[42px]">
                            <input
                                type="text"
                                placeholder="Search delivery location"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full h-full pl-9 pr-4 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-[#0c831f] dark:focus:border-[#0c831f] transition-colors placeholder:text-gray-400 text-gray-700 dark:text-white text-xs md:text-sm bg-gray-50 dark:bg-white/5"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Content Area - Scrollable */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-hide">
                        {/* Saved Addresses Section */}
                        {searchText.length === 0 && savedAddresses.length > 0 && (
                            <div className="mb-6">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Saved Addresses</p>
                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => (
                                        <button
                                            key={addr.id}
                                            onClick={() => handleAddressSelect(addr)}
                                            className="w-full text-left bg-gray-50 hover:bg-green-50 dark:bg-white/5 dark:hover:bg-[#0c831f]/10 p-3 rounded-xl border border-transparent hover:border-green-200 dark:hover:border-[#0c831f]/20 transition-all group active:scale-[0.99]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-[#0c831f] shrink-0">
                                                    <MapPin size={14} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-xs font-black text-gray-900 dark:text-gray-100">{addr.type}</span>
                                                        {addr.isDefault && (
                                                            <span className="px-1.5 py-0.5 bg-[#0c831f]/10 text-[#0c831f] text-[8px] font-bold rounded">DEFAULT</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 font-medium">{addr.address}, {addr.city}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* City Suggestions */}
                        {(searchText.length > 0 || savedAddresses.length === 0) && (
                            <div>
                                {searchText.length === 0 && (
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Popular Cities</p>
                                )}
                                {suggestions.map((city) => (
                                    <button
                                        key={city}
                                        onClick={() => handleManualSelect(city)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors group border-b border-gray-50 dark:border-white/5 last:border-0"
                                    >
                                        <MapPin size={14} className="text-gray-400 group-hover:text-[#0c831f]" />
                                        <span className="text-xs md:text-sm text-gray-700 dark:text-gray-200 font-medium">{city}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
