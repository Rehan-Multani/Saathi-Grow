import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoutes from '../modules/admin/routes/AdminRoutes';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path='/admin/*' element={<AdminRoutes />} />
                <Route path='/' element={<div>Home - Please go to <a href="/admin">/admin</a></div>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
