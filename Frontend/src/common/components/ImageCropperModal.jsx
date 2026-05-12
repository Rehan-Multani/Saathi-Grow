import React, { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Crop, X, Check } from 'lucide-react';

const ImageCropperModal = ({ show, imageSrc, onCancel, onCropComplete, aspect = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            );
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    return (
        <Modal show={show} onHide={onCancel} centered size="lg" backdrop="static" dialogClassName="crop-modal-dialog">
            <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: 'none' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: '#f0f7ff', color: '#3b82f6', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Crop size={22} strokeWidth={2.5} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h5 style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '18px', letterSpacing: '-0.02em' }}>Adjust Photo</h5>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drag to re-position • Scroll to zoom</span>
                        </div>
                    </div>
                    <button 
                        onClick={onCancel} 
                        style={{ background: '#f8fafc', border: 'none', color: '#64748b', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '0 24px 24px' }}>
                    <div style={{ position: 'relative', height: '420px', backgroundColor: '#0f172a', borderRadius: '20px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '64px' }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={onCropChange}
                                onCropComplete={onCropCompleteCallback}
                                onZoomChange={onZoomChange}
                            />
                        </div>
                        
                        {/* Zoom Control Bar */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px', backgroundColor: 'rgba(255, 255, 255, 0.98)', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zoom</span>
                                <input 
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    style={{ flex: 1, height: '6px', cursor: 'pointer', accentColor: '#3b82f6' }}
                                />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', width: '40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{parseFloat(zoom).toFixed(1)}x</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', gap: '12px', padding: '0 24px 24px' }}>
                    <button 
                        onClick={onCancel}
                        style={{ flex: 1, padding: '12px', borderRadius: '14px', fontWeight: 700, color: '#475569', backgroundColor: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={showCroppedImage}
                        style={{ flex: 1.5, padding: '12px', borderRadius: '14px', fontWeight: 700, color: 'white', backgroundColor: '#3b82f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                    >
                        <Check size={18} strokeWidth={3} /> Apply Changes
                    </button>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .crop-modal-dialog { max-width: 700px; }
                .crop-modal-dialog .modal-content { border: none; background: transparent; border-radius: 24px; }
            `}} />
        </Modal>
    );
};

export default ImageCropperModal;
