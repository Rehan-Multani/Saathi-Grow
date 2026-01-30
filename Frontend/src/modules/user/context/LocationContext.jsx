import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('saathigro_location');
        return saved ? JSON.parse(saved) : { address: 'Select Location', city: '' };
    });

    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('saathigro_location', JSON.stringify(location));
    }, [location]);

    const updateLocation = (newLocation) => {
        setLocation(newLocation);
        setShowLocationModal(false);
    };

    const openLocationModal = () => setShowLocationModal(true);
    const closeLocationModal = () => setShowLocationModal(false);

    return (
        <LocationContext.Provider
            value={{
                location,
                updateLocation,
                showLocationModal,
                openLocationModal,
                closeLocationModal
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};
