import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../api/userCartApi';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('saathigro_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const { token } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch cart from backend on mount or login
    useEffect(() => {
        const fetchRemoteCart = async () => {
            if (token) {
                try {
                    const data = await cartApi.getCart(token);
                    // the backend returns parsed Product objects with added `quantity`
                    // Map to Match frontend expectations securely
                    const formatted = data.map(p => ({
                        ...p,
                        id: p._id || p.id,
                        price: p.basePrice || p.price,
                        quantity: p.quantity
                    }));

                    // If there's local items that need merging to the cloud
                    const localCart = JSON.parse(localStorage.getItem('saathigro_cart') || '[]');

                    if (localCart.length > 0 && formatted.length === 0) {
                        // The User logged into a blank account but has stuff right now. Sync up immediately.
                        const mergedData = [...localCart];
                        setCart(mergedData);
                    } else {
                        // Default to using the authoritative cloud version
                        setCart(formatted);
                    }
                } catch (err) {
                    console.error('Failed to fetch user cart:', err);
                }
            }
        };
        fetchRemoteCart();
    }, [token]);

    // Continually backup to Local Storage and optionally Sync to Cloud if authenticated
    useEffect(() => {
        localStorage.setItem('saathigro_cart', JSON.stringify(cart));

        let timeoutId;
        if (token) {
            // Debounce syncing so dragging counters doesn't spam APIs extremely fast
            timeoutId = setTimeout(() => {
                cartApi.syncCart(token, cart).catch(err => console.error("Sync Cart Failure: " + err.message));
            }, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [cart, token]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const prodId = product.id || product._id;
            const priceToUse = product.price || product.basePrice || 0; // Fallback mapping

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

    const clearCart = () => setCart([]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                toggleCart,
                setIsCartOpen
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
