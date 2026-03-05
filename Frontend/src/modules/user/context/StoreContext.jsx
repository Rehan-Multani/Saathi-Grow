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
            if (!exists) {
              // Optionally handle logic if store is now out of range
              console.warn("Active store is no longer in range.");
            }
          }
        } catch (error) {
          console.error("Failed to fetch nearby stores:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStores();
  }, [location?.coordinates]);

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
  };

  return (
    <StoreContext.Provider
      value={{
        activeStore,
        nearbyStores,
        selectStore,
        loading,
        setActiveStore
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
