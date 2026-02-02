import React, { useState, useCallback } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

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
        <Modal show={show} onHide={onCancel} centered size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Crop Image</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ position: 'relative', height: '400px', backgroundColor: '#333' }}>
                <div className="crop-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '60px' }}>
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
                <div className="controls" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', background: 'white' }}>
                    <Form.Range
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="w-50"
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={showCroppedImage}>
                    Apply Crop
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ImageCropperModal;
