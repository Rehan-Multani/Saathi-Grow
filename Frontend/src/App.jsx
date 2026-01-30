import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './modules/user/context/AuthContext';
import { CartProvider } from './modules/user/context/CartContext';
import { LocationProvider } from './modules/user/context/LocationContext';
import { SearchProvider } from './modules/user/context/SearchContext';
import UserRoutes from './modules/user/routes/UserRoutes';
import LoginModal from './modules/user/components/auth/LoginModal';
import LocationModal from './modules/user/components/location/LocationModal';

function App() {
    return (
        <AuthProvider>
            <LocationProvider>
                <SearchProvider>
                    <CartProvider>
                        <BrowserRouter>
                            <UserRoutes />
                            <LoginModal />
                            <LocationModal />
                        </BrowserRouter>
                    </CartProvider>
                </SearchProvider>
            </LocationProvider>
        </AuthProvider>
    );
}

export default App;
