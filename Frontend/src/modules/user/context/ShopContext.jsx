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
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeStore } = useStore();
  const { clearCart } = useCart();
  const [lastStoreId, setLastStoreId] = useState(activeStore?.id);

  const refreshShopData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const fetchParams = activeStore ? { storeId: activeStore.id, storeType: activeStore.type } : {};
      const [categoriesData, campaignsData, offersData] = await Promise.all([
        fetchCategories(),
        fetchActiveCampaigns(fetchParams).catch(() => []),
        fetchActiveOfferDeals(fetchParams).catch(() => [])
      ]);
      setCategories(categoriesData);
      setProducts([]); // No longer needed for home page mapping
      setCampaigns(campaignsData);
      setOffers(offersData);
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
        toast.info("Cart cleared due to store switch");
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

  return (
    <ShopContext.Provider
      value={{
        categories,
        products,
        campaigns,
        offers,
        loading,
        error,
        refreshShopData,
        getProductsByCategory
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
