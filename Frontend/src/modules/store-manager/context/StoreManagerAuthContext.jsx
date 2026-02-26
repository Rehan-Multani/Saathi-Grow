import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../../admin/api/adminApi';

const StoreManagerAuthContext = createContext();

export const useStoreManagerAuth = () => useContext(StoreManagerAuthContext);

export const StoreManagerAuthProvider = ({ children }) => {
  const [managerUser, setManagerUser] = useState(() => {
    const saved = localStorage.getItem('sathiGro_manager');
    return saved ? JSON.parse(saved) : null;
  });

  const managerLogin = async (email, password) => {
    try {
      const data = await loginAdmin(email, password);
      if (data.role !== 'Branch Manager') {
        throw new Error('Access denied. This portal is only for Branch Managers.');
      }
      setManagerUser(data);
      localStorage.setItem('sathiGro_manager', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const managerLogout = () => {
    setManagerUser(null);
    localStorage.removeItem('sathiGro_manager');
  };

  return (
    <StoreManagerAuthContext.Provider value={{ managerUser, managerLogin, managerLogout }}>
      {children}
    </StoreManagerAuthContext.Provider>
  );
};
