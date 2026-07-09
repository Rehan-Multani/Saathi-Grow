import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocation } from './LocationContext';
import { getNearbyStores } from '../api/shopApi';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const { location } = useLocation();
  const [activeStore, setActiveStore] = useState(() => {
    const saved = localStorage.getItem('saathigro_activeStore');
    return saved ? JSON.parse(saved) : null;
  });
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStoreOutOfRange, setIsStoreOutOfRange] = useState(false);
  const [isStoreInactive, setIsStoreInactive] = useState(false); // New flag for production status management
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);

  // Fetch nearby stores and automatically select the nearest one whenever location changes
  useEffect(() => {
    const fetchStores = async () => {
      if (location?.coordinates) {
        setLoading(true);
        try {
          const [lng, lat] = location.coordinates;
          const stores = await getNearbyStores(lat, lng);
          setNearbyStores(stores);

          if (stores && stores.length > 0) {
            const nearestStore = stores[0];
            // Auto-select nearest store if none selected or if location changed
            // Requirement: User should not have option to select, nearest should be automatic.
            if (!activeStore || activeStore.id !== nearestStore.id) {
                setActiveStore(nearestStore);
            }
            setIsStoreOutOfRange(false);
            setIsStoreInactive(false);
          } else {
            setActiveStore(null);
            setIsStoreOutOfRange(true);
            setIsStoreInactive(true);
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
  }, [location?.coordinates]); // Removed activeStore?.id to prevent duplicate fetching

  // Persist active store selection
  useEffect(() => {
    if (activeStore) {
      localStorage.setItem('saathigro_activeStore', JSON.stringify(activeStore));
    } else {
      localStorage.removeItem('saathigro_activeStore');
    }
  }, [activeStore]);

  const selectStore = (store) => {
    setActiveStore(store);
    setIsStoreOutOfRange(false);
    setIsStoreInactive(false);
  };

  const contextValue = useMemo(() => ({
    activeStore,
    nearbyStores,
    isStoreOutOfRange,
    isStoreInactive,
    selectStore,
    loading,
    setActiveStore,
    isStoreSelectorOpen: false, // Always false
    setIsStoreSelectorOpen: () => {}, // No-op
    openStoreSelector: () => {}, // No-op
    closeStoreSelector: () => {} // No-op
  }), [activeStore, nearbyStores, isStoreOutOfRange, isStoreInactive, loading]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;
