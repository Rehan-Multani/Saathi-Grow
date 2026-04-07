import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCategories, fetchProducts, fetchActiveCampaigns, fetchActiveOfferDeals } from '../api/shopApi';
import { useStore } from './StoreContext';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('shop_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('shop_campaigns');
    return saved ? JSON.parse(saved) : [];
  });
  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('shop_offers');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!localStorage.getItem('shop_categories'));
  const [error, setError] = useState(null);
  const { activeStore } = useStore();
  const { clearCart } = useCart();
  const [lastStoreId, setLastStoreId] = useState(activeStore?.id);

  const [settings, setSettings] = useState(null);

  const refreshShopData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const fetchParams = activeStore ? { storeId: activeStore.id, storeType: activeStore.type } : {};
      const [categoriesData, campaignsData, offersData, settingsData] = await Promise.all([
        fetchCategories(),
        fetchActiveCampaigns(fetchParams).catch(() => []),
        fetchActiveOfferDeals(fetchParams).catch(() => []),
        import('../api/shopApi').then(m => m.fetchPublicSettings()).catch(() => null)
      ]);
      setCategories(categoriesData);
      localStorage.setItem('shop_categories', JSON.stringify(categoriesData));
      
      setProducts([]); // No longer needed for home page mapping
      
      setCampaigns(campaignsData);
      localStorage.setItem('shop_campaigns', JSON.stringify(campaignsData));

      // Filter offers that are isActive and not expired
      const now = new Date();
      const filteredOffers = (offersData || []).filter(o => 
        o.isActive && (!o.expiryDate || new Date(o.expiryDate) > now)
      );
      setOffers(filteredOffers);
      localStorage.setItem('shop_offers', JSON.stringify(filteredOffers));
      
      setSettings(settingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Watch for store changes to clear cart and refresh data
  useEffect(() => {
    if (activeStore?.id !== lastStoreId) {
      if (lastStoreId && activeStore?.id) {
        // Only clear cart if it was a real switch between two different stores
        clearCart();
      }
      setLastStoreId(activeStore?.id);
      refreshShopData();
    }
  }, [activeStore?.id]);

  useEffect(() => {
    refreshShopData();
  }, []);

  const getProductsByCategory = (categoryName) => {
    if (!categoryName) return [];
    return products.filter(p =>
      p.category === categoryName ||
      p.category?.toLowerCase() === categoryName?.toLowerCase()
    );
  };

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
  return (
    <ShopContext.Provider
      value={{
        categories,
        products,
        campaigns,
        offers,
        loading,
        error,
        settings,
        refreshShopData,
        getProductsByCategory,
        isBottomSheetOpen,
        setIsBottomSheetOpen
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
