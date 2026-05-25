import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsSearchOverlayOpen(false);
    }, [location.pathname]);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen }}>
            {children}
        </SearchContext.Provider>
    );
};


