import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('saathigro_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('saathigro_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        const exists = wishlist.find(item => item.id === product.id);
        if (exists) {
            setWishlist(wishlist.filter(item => item.id !== product.id));
            toast.info(`${product.name} removed from wishlist`, {
                icon: <Heart size={16} className="text-gray-400" />,
                style: {
                    borderRadius: '14px',
                    background: document.documentElement.classList.contains('dark') ? '#000' : '#f0fdf4',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid #0c831f20'
                }
            });
        } else {
            setWishlist([...wishlist, product]);
            toast.success(`${product.name} added to wishlist!`, {
                icon: <Heart size={16} className="text-red-500 fill-red-500" />,
                style: {
                    borderRadius: '14px',
                    background: document.documentElement.classList.contains('dark') ? '#000' : '#f0fdf4',
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid #0c831f20'
                }
            });
        }
    };

    const isInWishlist = (id) => wishlist.some(item => item.id === id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
