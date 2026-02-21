import { useEffect } from 'react';
import useDeliveryStore from '../store/deliveryStore';

const useLocationTracking = (token, isActive) => {
    const updateLocation = useDeliveryStore((state) => state.updateLocation);

    useEffect(() => {
        let watchId;

        if (isActive && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    updateLocation(token, longitude, latitude);
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

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isActive, token, updateLocation]);
};

export default useLocationTracking;
