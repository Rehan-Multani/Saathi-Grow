import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as addressApi from '../api/userAddressApi';


const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(() => {
        const saved = localStorage.getItem('sathiGro_location');
        return saved ? JSON.parse(saved) : { address: 'Select Location', city: '' };
    });

    const [savedAddresses, setSavedAddresses] = useState(() => {
        const saved = localStorage.getItem('saathigro_saved_addresses');
        return saved ? JSON.parse(saved) : [];
    });

    const { token, user } = useAuth();
    const [showLocationModal, setShowLocationModal] = useState(false);

    // Fetch user addresses from the backend on mount or when token changes
    useEffect(() => {
        const fetchRemoteAddresses = async () => {
            if (token) {
                try {
                    const data = await addressApi.getAddresses(token);
                    // Map backend data format to LocationContext unified format if needed
                    // The backend stores: { _id, label, street, city, state, zipCode, isDefault }
                    const formatted = data.map(addr => ({
                        id: addr._id,
                        type: addr.label,
                        name: addr.name,
                        phone: addr.phone,
                        address: addr.street || addr.city,
                        city: `${addr.city || ''} ${addr.zipCode || ''}`.trim(),
                        isDefault: addr.isDefault
                    }));
                    setSavedAddresses(formatted);
                } catch (err) {
                    console.error('Failed to fetch user addresses:', err);
                }
            }
        };
        fetchRemoteAddresses();
    }, [token]);

    useEffect(() => {
        localStorage.setItem('sathiGro_location', JSON.stringify(location));
    }, [location]);

    useEffect(() => {
        // Only save to localStorage offline sync if user is NOT logged in.
        // Or keep sync active, since it safely overwrites on remote fetch
        if (!token) {
            localStorage.setItem('saathigro_saved_addresses', JSON.stringify(savedAddresses));
        }
    }, [savedAddresses, token]);

    const updateLocation = (newLocation) => {
        setLocation(newLocation);
        setShowLocationModal(false);
    };
    const addAddress = async (address) => {
        if (token) {
            try {
                // Translate frontend format { type, address, city } to backend { label, street, city }
                const resData = await addressApi.addAddress(token, {
                    label: address.type,
                    name: address.name,
                    phone: address.phone,
                    street: address.address,
                    city: address.city,
                    isDefault: address.isDefault !== undefined ? address.isDefault : savedAddresses.length === 0
                });
                // Refresh
                const formatted = resData.map(addr => ({
                    id: addr._id,
                    type: addr.label,
                    name: addr.name,
                    phone: addr.phone,
                    address: addr.street || addr.city,
                    city: `${addr.city || ''} ${addr.zipCode || ''}`.trim(),
                    isDefault: addr.isDefault
                }));
                setSavedAddresses(formatted);
            } catch (error) {
                console.error("Add remote address failed", error);
            }
        } else {
            const newAddress = { ...address, id: Date.now(), isDefault: address.isDefault !== undefined ? address.isDefault : savedAddresses.length === 0 };
            if (newAddress.isDefault) {
                setSavedAddresses([...savedAddresses.map(a => ({ ...a, isDefault: false })), newAddress]);
            } else {
                setSavedAddresses([...savedAddresses, newAddress]);
            }
        }
    };

    const editAddress = async (id, updatedAddress) => {
        if (token) {
            try {
                const resData = await addressApi.updateAddress(token, id, {
                    label: updatedAddress.type,
                    name: updatedAddress.name,
                    phone: updatedAddress.phone,
                    street: updatedAddress.address,
                    city: updatedAddress.city,
                    isDefault: updatedAddress.isDefault
                });
                const formatted = resData.map(addr => ({
                    id: addr._id,
                    type: addr.label,
                    name: addr.name,
                    phone: addr.phone,
                    address: addr.street || addr.city,
                    city: `${addr.city || ''} ${addr.zipCode || ''}`.trim(),
                    isDefault: addr.isDefault
                }));
                setSavedAddresses(formatted);
            } catch (error) {
                console.error("Update remote address failed", error);
            }
        } else {
            setSavedAddresses(savedAddresses.map(addr => {
                if (String(addr.id) === String(id)) return { ...addr, ...updatedAddress };
                if (updatedAddress.isDefault) return { ...addr, isDefault: false };
                return addr;
            }));
        }
    };

    const deleteAddress = async (id) => {
        if (token) {
            try {
                const resData = await addressApi.deleteAddress(token, id);
                const formatted = resData.addresses.map(addr => ({
                    id: addr._id,
                    type: addr.label,
                    name: addr.name,
                    phone: addr.phone,
                    address: addr.street || addr.city,
                    city: `${addr.city || ''} ${addr.zipCode || ''}`.trim(),
                    isDefault: addr.isDefault
                }));
                setSavedAddresses(formatted);
            } catch (error) {
                console.error("Delete remote address failed", error);
            }
        } else {
            setSavedAddresses(savedAddresses.filter(addr => String(addr.id) !== String(id)));
        }
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

