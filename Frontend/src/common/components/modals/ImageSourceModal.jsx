import React, { useEffect } from 'react';
import { Camera, Image, X } from 'lucide-react';

const ImageSourceModal = ({ isOpen, onClose, onSelect }) => {

    useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
        }
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
        return new Promise((resolve) => {
            if (!window.URL || !window.URL.createObjectURL || !document.createElement('canvas')) {
                resolve(file);
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const img = new window.Image();
            img.src = objectUrl;
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const name = (file.name || 'image.jpg').replace(/\.[^/.]+$/, "") + '.jpg';
                            try {
                                const compressedFile = new File([blob], name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            } catch (e) {
                                blob.name = name;
                                resolve(blob);
                            }
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            };
        });
    };

    const normalizeAndSelect = async (file) => {
        if (!file) return;

        console.log('Original file:', file.name, file.type, file.size, 'bytes');
        
        if (file.size === 0) {
            console.error('Camera returned empty file. Please try again.');
            alert('Image capture failed. Please try again or select from gallery.');
            return;
        }

        let processedFile = file;
        try {
            processedFile = await compressImage(file);
            console.log('Processed file:', processedFile.name, processedFile.type, processedFile.size, 'bytes');
        } catch (err) {
            console.warn('Image compression failed, using original file:', err);
        }

        onSelect(processedFile);
        onClose();
    };

    const handleChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) normalizeAndSelect(file);
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-[11000] flex items-end justify-center sm:items-center p-0 sm:p-4 font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="bg-white dark:bg-[#111111] w-full sm:max-w-[360px] relative z-10 overflow-hidden rounded-t-[32px] sm:rounded-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t sm:border border-white/20 dark:border-white/5 p-6 animate-in slide-in-from-bottom duration-300">

                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" onClick={onClose} />

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

                {/* Options — use <label> so tap directly triggers the hidden input (works on all mobile browsers) */}
                <div className="grid grid-cols-2 gap-4">

                    {/* ── Camera ── */}
                    <label
                        htmlFor="img-source-camera"
                        className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-[#0c831f]/5 dark:bg-white/5 dark:hover:bg-[#0c831f]/10 border border-gray-100 dark:border-white/5 hover:border-[#0c831f]/20 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#0c831f]/10 flex items-center justify-center mb-3">
                            <Camera size={22} className="text-[#0c831f]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Take Photo</span>
                        <input
                            id="img-source-camera"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleChange}
                            className="sr-only"
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                    </label>

                    {/* ── Gallery ── */}
                    <label
                        htmlFor="img-source-gallery"
                        className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 hover:bg-[#0c831f]/5 dark:bg-white/5 dark:hover:bg-[#0c831f]/10 border border-gray-100 dark:border-white/5 hover:border-[#0c831f]/20 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#0c831f]/10 flex items-center justify-center mb-3">
                            <Image size={22} className="text-[#0c831f]" />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Upload Gallery</span>
                        <input
                            id="img-source-gallery"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="sr-only"
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                    </label>

                </div>
            </div>
        </div>
    );
};

export default ImageSourceModal;
