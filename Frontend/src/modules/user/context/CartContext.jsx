import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useNavigate } from 'react-router-dom';
import * as cartApi from '../api/userCartApi';
import { getPublicSettings } from '../api/publicSettingApi';
import { toast } from 'react-toastify';


const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Start with an empty cart — NEVER pre-fill from localStorage on initial render.
    // Authenticated users will get their authoritative cloud cart fetched below.
    // Guest users will get their localStorage cart restored only if not logged in.
    const [cart, setCart] = useState([]);
    const [cartReady, setCartReady] = useState(false); // track if cart has been initialized

    const { token, logout } = useAuth();
    const { activeStore } = useStore();
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [publicSettings, setPublicSettings] = useState({
        baseDeliveryFee: 0,
        handlingFee: 0,
        surgeMultiplier: 1,
        freeDeliveryThreshold: 500
    });

    // Fetch public rules and cart
    useEffect(() => {
        const fetchSettingsAndCart = async () => {
            try {
                const settingsInfo = await getPublicSettings();
                setPublicSettings(settingsInfo);
            } catch (e) {
                console.error("Failed fetching settings rulebook", e);
            }

            if (token) {
                // Authenticated: always use the cloud cart as the source of truth
                try {
                    const data = await cartApi.getCart(token);
                    const formatted = data.map(p => ({
                        ...p,
                        id: p._id || p.id,
                        price: p.basePrice || p.price,
                        quantity: p.quantity
                    }));
                    // Clear stale localStorage cart and use server version
                    localStorage.removeItem('sathiGro_cart');
                    setCart(formatted);
                } catch (err) {
                    console.error('Failed to fetch user cart:', err);
                    // Fallback to localStorage only if server fetch completely fails
                    try {
                        const saved = localStorage.getItem('sathiGro_cart');
                        if (saved) setCart(JSON.parse(saved));
                    } catch { }
                }
            } else {
                // Not authenticated: restore guest cart from localStorage
                try {
                    const saved = localStorage.getItem('sathiGro_cart');
                    setCart(saved ? JSON.parse(saved) : []);
                } catch {
                    setCart([]);
                }
            }
            setCartReady(true);
        };
        fetchSettingsAndCart();
    }, [token]);

    // Continually backup to Local Storage and optionally Sync to Cloud if authenticated
    // IMPORTANT: only sync AFTER cartReady=true to avoid overwriting the server cart with the initial []
    useEffect(() => {
        if (!cartReady) return; // don't sync until cart has been fetched/initialized

        localStorage.setItem('sathiGro_cart', JSON.stringify(cart));

        let timeoutId;
        if (token) {
            // Debounce syncing so dragging counters doesn't spam APIs extremely fast
            timeoutId = setTimeout(() => {
                cartApi.syncCart(token, cart).catch(err => {
                    console.error("Sync Cart Failure: " + err.message);
                    // SECURITY: If user is deactivated/blocked (403), force logout immediately
                    if (err.statusCode === 403 || err.message?.toLowerCase().includes('deactivated')) {
                        toast.error("Your account has been deactivated. Logging out...", { toastId: 'cart-deactivated' });
                        logout();
                        navigate('/');
                    }
                });
            }, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [cart, token, cartReady]);



    const addToCart = (product) => {
        // Enforce Store-First logic: Only add if deliverable from the ACTIVE store
        if (product.isDeliverable === false) {
            toast.error("Not deliverable from this store", { toastId: 'not-deliverable' });
            return;
        }

        if (!activeStore) {
            toast.warning("Please select a store first", { toastId: 'select-store' });
            return;
        }

        const availableStock = product.availableStock ?? 999;
        const threshold = product.lowStockThreshold || 0;
        const maxAllowed = Math.max(0, availableStock - threshold);
        const prodId = product.id || product._id;

        if (maxAllowed <= 0) {
            toast.error("Safety stock limit reached", { toastId: `stock-limit-${prodId}` });
            return;
        }

        const existingItem = cart.find(item => item.id === prodId);
        if (existingItem && existingItem.quantity >= maxAllowed) {
            toast.warning(`Max ${maxAllowed} units allowed`, { toastId: `stock-limit-${prodId}` });
            return;
        }

        setCart((prevCart) => {
            const priceToUse = product.price || product.basePrice || 0;
            const existing = prevCart.find((item) => item.id === prodId);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === prodId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, id: prodId, price: priceToUse, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        if (delta > 0) {
            const item = cart.find(i => i.id === id);
            if (item) {
                const availableStock = item.availableStock ?? 999;
                const threshold = item.lowStockThreshold || 0;
                const maxAllowed = Math.max(0, availableStock - threshold);
                if (item.quantity + delta > maxAllowed) {
                    toast.warning(`Max ${maxAllowed} units allowed`, { toastId: `stock-limit-${id}` });
                    return;
                }
            }
        }

        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === id) {
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const clearCart = async () => {
        setCart([]);
        localStorage.removeItem('sathiGro_cart');
        // Also wipe on server so items don't come back on next login
        if (token) {
            try {
                await cartApi.clearCartOnServer(token);
            } catch (err) {
                console.error('Failed to clear server cart:', err);
            }
        }
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                cartReady,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                toggleCart,
                setIsCartOpen,
                publicSettings
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

