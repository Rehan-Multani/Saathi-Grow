import React from 'react';
import { Bell, Store } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { useNavigate } from 'react-router-dom';

const VendorHeader = () => {
    const { vendor } = useVendor();
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 ml-0 md:ml-64 sticky top-0 z-30 transition-all duration-200">
            {/* Left Spacer / Breadcrumb placeholder */}
            <div className="flex items-center gap-2 md:pl-0 pl-14">
                <div className={`w-2.5 h-2.5 rounded-full ${vendor.isOpen ? 'bg-[#0c831f]' : 'bg-red-500'} shadow-sm`}></div>
                <span className="text-xs font-bold text-gray-600 tracking-wide">{vendor.isOpen ? 'Shop is Live' : 'Shop is Closed'}</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                <div className="relative">
                    <button
                        onClick={() => navigate('/vendor/notifications')}
                        className="relative p-2 rounded-full transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>

                <div className="flex items-center gap-4 pl-6 h-10">
                    <div className="text-right hidden sm:flex flex-col justify-center mr-2">
                        <p className="text-base font-bold text-gray-900 leading-none mb-1">{vendor.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{vendor.owner}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 p-0.5 border border-gray-200 shadow-sm">
                        <img src={vendor.image} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default VendorHeader;
