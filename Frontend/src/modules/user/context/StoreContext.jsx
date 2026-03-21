import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from './LocationContext';
import { getNearbyStores } from '../api/shopApi';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const { location } = useLocation();
  const [activeStore, setActiveStore] = useState(() => {
    const saved = localStorage.getItem('sathiGro_activeStore');
    return saved ? JSON.parse(saved) : null;
  });
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStoreOutOfRange, setIsStoreOutOfRange] = useState(false);
  const [isStoreInactive, setIsStoreInactive] = useState(false); // New flag for production status management
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  // Fetch nearby stores whenever the user's location changes
  useEffect(() => {
    const fetchStores = async () => {
      if (location?.coordinates) {
        setLoading(true);
        try {
          const [lng, lat] = location.coordinates;
          const stores = await getNearbyStores(lat, lng);
          setNearbyStores(stores);

          // If we have an active store, check if it's still in the nearby list
          if (activeStore) {
            const exists = stores.find(s => s.id === activeStore.id);
            
            // In a production app, "exists" might be null if 
            // 1. Store is too far
            // 2. Store is Inactive (since backend filters inactive ones)
            if (!exists) {
              // We should decide if it's out of range OR inactive.
              // Since getNearbyStores returns all active stores up to 25km,
              // "not exists" usually means either too far or inactive.
              setIsStoreOutOfRange(true);
              setIsStoreInactive(true); // Treat as inactive for UX safety
            } else {
              setIsStoreOutOfRange(false);
              setIsStoreInactive(false);
            }
          } else {
            setIsStoreOutOfRange(false);
            setIsStoreInactive(false);
          }
        } catch (error) {
          console.error("Failed to fetch nearby stores:", error);
          setIsStoreOutOfRange(false);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStores();
  }, [location?.coordinates]);

  // Handle auto-opening of store selector
  useEffect(() => {
    if (location?.coordinates) {
      if (!activeStore || isStoreOutOfRange) {
        setIsStoreSelectorOpen(true);
      }
    }
  }, [location?.coordinates, isStoreOutOfRange, activeStore?.id]);

  // Persist active store selection
  useEffect(() => {
    if (activeStore) {
      localStorage.setItem('sathiGro_activeStore', JSON.stringify(activeStore));
    } else {
      localStorage.removeItem('sathiGro_activeStore');
    }
  }, [activeStore]);

  const selectStore = (store) => {
    setActiveStore(store);
    setIsStoreOutOfRange(false); // Reset on selection
    setIsStoreInactive(false);
  };

  return (
    <StoreContext.Provider
      value={{
        activeStore,
        nearbyStores,
        isStoreOutOfRange,
        isStoreInactive,
        selectStore,
        loading,
        setActiveStore,
        isStoreSelectorOpen,
        setIsStoreSelectorOpen,
        openStoreSelector: () => setIsStoreSelectorOpen(true),
        closeStoreSelector: () => setIsStoreSelectorOpen(false)
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
