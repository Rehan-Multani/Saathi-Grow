import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('sathiGro_wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('sathiGro_wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error('Error saving wishlist to localStorage:', error);
        }
    }, [wishlist]);

    const addToWishlist = (product) => {
        if (!isInWishlist(product.id)) {
            setWishlist(prev => [...prev, product]);
            toast.success(`${product.name} added to wishlist!`, {
                icon: <Heart size={16} className="text-red-500 fill-red-500" />,
                style: {
                    borderRadius: '14px',
                    background: document.documentElement.classList.contains('dark') ? '#000' : '#fff1f2',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#be123c',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid #be123c20'
                }
            });
        }
    };

    const removeFromWishlist = (productId) => {
        setWishlist(prev => prev.filter(item => item.id !== productId));
        toast.info(`Item removed from wishlist`, {
            icon: <Heart size={16} className="text-gray-400" />,
            style: {
                borderRadius: '14px',
                background: document.documentElement.classList.contains('dark') ? '#000' : '#f9fafb',
                color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '1px solid #e5e7eb'
            }
        });
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

