import React, { useRef } from 'react';
import { Camera, Image, X } from 'lucide-react';

const ImageSourceModal = ({ isOpen, onClose, onSelect }) => {
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onSelect(file);
        }
        onClose();
        // Reset inputs so the same file can be selected again if needed
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-[11000] flex items-end justify-center sm:items-center p-0 sm:p-4 font-sans animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Content Card (Slide up on mobile, Zoom on desktop) */}
            <div className="bg-white dark:bg-[#111111] w-full sm:max-w-[360px] relative z-10 overflow-hidden rounded-t-[32px] sm:rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.2),0_20px_50px_rgba(0,0,0,0.3)] border-t sm:border border-white/20 dark:border-white/5 p-6 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                
                {/* Drag Handle on Mobile */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" onClick={onClose} />

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                        Select Image Source
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Camera Button */}
                    <button
                        onClick={() => cameraInputRef.current.click()}
                        className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-[#0c831f]/5 dark:bg-white/5 dark:hover:bg-[#0c831f]/10 border border-gray-100 dark:border-white/5 hover:border-[#0c831f]/20 transition-all duration-300 group active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#0c831f]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Camera size={22} className="text-[#0c831f]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Take Photo</span>
                    </button>

                    {/* Gallery Button */}
                    <button
                        onClick={() => galleryInputRef.current.click()}
                        className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-[#0c831f]/5 dark:bg-white/5 dark:hover:bg-[#0c831f]/10 border border-gray-100 dark:border-white/5 hover:border-[#0c831f]/20 transition-all duration-300 group active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#0c831f]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Image size={22} className="text-[#0c831f]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Upload Gallery</span>
                    </button>
                </div>

                {/* Hidden File Inputs */}
                <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ImageSourceModal;
