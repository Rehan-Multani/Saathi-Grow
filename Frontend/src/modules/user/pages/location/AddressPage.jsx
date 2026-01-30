import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, ArrowLeft } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const AddressPage = () => {
    const { updateLocation } = useLocation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [detecting, setDetecting] = useState(false);

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
                        navigate('/'); // Navigate to home after selection
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
        navigate('/'); // Navigate to home after selection
    };

    const suggestions = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Indore', 'Bhopal', 'Chandigarh', 'Noida', 'Gurgaon'].filter(
        city => city.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="relative min-h-[calc(100vh-64px)] flex items-start md:items-center justify-center py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Image with Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop")',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative z-10 animate-in zoom-in-95 duration-300 my-auto">
                <div className="p-4 border-b border-gray-100 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Select Location</h1>
                </div>

                <div className="p-4 md:p-6">
                    {/* Detect Location Button */}
                    <button
                        onClick={handleDetectLocation}
                        className="w-full flex items-center gap-3 p-3 md:p-4 bg-green-50 border border-green-100 rounded-xl mb-4 md:mb-6 group cursor-pointer hover:bg-green-100 transition-colors"
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
                    <div className="max-h-96 overflow-y-auto">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Saved Addresses & Suggestions</h3>

                        {/* Always show what user is typing as an option if it has length */}
                        {searchText.trim().length > 0 && !suggestions.includes(searchText) && (
                            <button
                                onClick={() => handleManualSelect(searchText)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 text-left"
                            >
                                <MapPin size={18} className="text-[#0c831f]" />
                                <span className="text-sm text-gray-700 font-medium">Use "{searchText}"</span>
                            </button>
                        )}

                        {suggestions.map((city) => (
                            <button
                                key={city}
                                onClick={() => handleManualSelect(city)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 text-left"
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

export default AddressPage;
