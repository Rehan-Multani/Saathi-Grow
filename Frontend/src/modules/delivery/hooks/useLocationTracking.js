import { useEffect, useRef } from 'react';
import useDeliveryStore from '../store/deliveryStore';
import { db } from '../../../config/firebase';
import { ref, update } from 'firebase/database';

const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const Math_PI = Math.PI;
    const dLon = (lon2 - lon1) * Math_PI / 180;
    lat1 = lat1 * Math_PI / 180;
    lat2 = lat2 * Math_PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let bearing = Math.atan2(y, x) * 180 / Math_PI;
    return (bearing + 360) % 360;
};

const useLocationTracking = (token, isActive, activeOrderId = null) => {
    const updateLocation = useDeliveryStore((state) => state.updateLocation);
    const setLocalLocation = useDeliveryStore((state) => state.setLocalLocation);
    const prevLocation = useRef(null);
    const lastDbUpdateTime = useRef(0);
    const wakeLock = useRef(null);

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLock.current = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.error(`Wake Lock error: ${err.name}, ${err.message}`);
        }
    };

    const releaseWakeLock = () => {
        if (wakeLock.current !== null) {
            wakeLock.current.release()
                .then(() => {
                    wakeLock.current = null;
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        let watchId;

        if (isActive) {
            requestWakeLock();

            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { longitude, latitude, speed } = position.coords;
                        const now = Date.now();

                        // 1. UPDATE THE UI LOCALLY AND INSTANTLY (Smooth Animations for Rider View)
                        setLocalLocation(longitude, latitude);

                        // 2. THROTTLE Rest API (MongoDB) update to only once every 2 minutes
                        // to prevent DDOSing your Node.js backend
                        if (now - lastDbUpdateTime.current > 120000) {
                            updateLocation(token, longitude, latitude);
                            lastDbUpdateTime.current = now;
                        }

                        if (activeOrderId) {
                            let heading = position.coords.heading || 0;
                            if (prevLocation.current && (!heading || heading === 0)) {
                                heading = calculateBearing(
                                    prevLocation.current.latitude,
                                    prevLocation.current.longitude,
                                    latitude,
                                    longitude
                                );
                            }
                            prevLocation.current = { latitude, longitude };

                            // Firebase RTDB handles high-frequency updates efficiently
                            const trackingRef = ref(db, `active_trackings/${activeOrderId}`);
                            update(trackingRef, {
                                location: { lat: latitude, lng: longitude },
                                heading: heading,
                                speed: speed || 0,
                                updatedAt: now
                            }).catch(e => console.error("Firebase update failed", e));
                        }
                    },
                    (error) => {
                        console.error('Location tracking error:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            }
        } else {
            releaseWakeLock();
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            releaseWakeLock();
        };
    }, [isActive, token, updateLocation, activeOrderId]);
};

export default useLocationTracking;
