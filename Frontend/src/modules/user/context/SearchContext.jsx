import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, isSearchOverlayOpen, setIsSearchOverlayOpen }}>
            {children}
        </SearchContext.Provider>
    );
};
