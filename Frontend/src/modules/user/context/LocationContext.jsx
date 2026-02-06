import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('saathigro_location');
        return saved ? JSON.parse(saved) : { address: 'Select Location', city: '' };
    });

    const [savedAddresses, setSavedAddresses] = useState(() => {
        const saved = localStorage.getItem('saathigro_saved_addresses');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                type: 'Home',
                address: 'H.No 45, Green Valley Apartments, Civil Lines',
                city: 'Delhi, 110054',
                isDefault: true,
                lastOrder: { date: '24 Jan 2024', items: 5, total: '₹540' }
            },
            {
                id: 2,
                type: 'Office',
                address: 'Tower B, Tech Park, Sector 62',
                city: 'Noida, 201309',
                isDefault: false,
                lastOrder: { date: '02 Feb 2024', items: 2, total: '₹210' }
            }
        ];
    });

    const [showLocationModal, setShowLocationModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('saathigro_location', JSON.stringify(location));
    }, [location]);

    useEffect(() => {
        localStorage.setItem('saathigro_saved_addresses', JSON.stringify(savedAddresses));
    }, [savedAddresses]);

    const updateLocation = (newLocation) => {
        setLocation(newLocation);
        setShowLocationModal(false);
    };

    const addAddress = (address) => {
        const newAddress = { ...address, id: Date.now(), lastOrder: { date: 'No orders', items: 0, total: '₹0' } };
        setSavedAddresses([...savedAddresses, newAddress]);
    };

    const editAddress = (id, updatedAddress) => {
        setSavedAddresses(savedAddresses.map(addr => addr.id === id ? { ...addr, ...updatedAddress } : addr));
    };

    const deleteAddress = (id) => {
        setSavedAddresses(savedAddresses.filter(addr => addr.id !== id));
    };

    const openLocationModal = () => setShowLocationModal(true);
    const closeLocationModal = () => setShowLocationModal(false);

    return (
        <LocationContext.Provider
            value={{
                location,
                updateLocation,
                savedAddresses,
                addAddress,
                editAddress,
                deleteAddress,
                showLocationModal,
                openLocationModal,
                closeLocationModal
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};
