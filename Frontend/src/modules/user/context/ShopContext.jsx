import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCategories, fetchProducts, fetchActiveCampaigns, fetchActiveOfferDeals } from '../api/shopApi';

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

  const refreshShopData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData, campaignsData, offersData] = await Promise.all([
        fetchCategories(),
        fetchProducts({ status: 'Active' }),
        fetchActiveCampaigns().catch(() => []), // Don't fail if no campaigns
        fetchActiveOfferDeals().catch(() => []) // Don't fail if no offers
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
      setCampaigns(campaignsData);
      setOffers(offersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching shop data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
