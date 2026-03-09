import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../../admin/api/adminApi';

const StoreManagerAuthContext = createContext();

export const useStoreManagerAuth = () => useContext(StoreManagerAuthContext);

export const StoreManagerAuthProvider = ({ children }) => {
  const [managerUser, setManagerUser] = useState(() => {
    const saved = localStorage.getItem('sathiGro_manager');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto-refresh profile on mount to sync permissions/status
  useEffect(() => {
    if (managerUser?.token) {
      refreshProfile();
    }
  }, []);

  const refreshProfile = async () => {
    try {
      const { getProfile } = await import('../../admin/api/adminApi');
      const data = await getProfile(managerUser.token);
      // Sync user data keeping token
      const updatedUser = { ...data, token: managerUser.token };
      setManagerUser(updatedUser);
      localStorage.setItem('sathiGro_manager', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh manager profile:', error);
      if (error.response?.status === 401) {
        managerLogout();
      }
    }
  };

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

  const managerUpdateProfile = async (profileData) => {
    if (!managerUser?.token) throw new Error('Not authenticated');
    const { updateProfile: updateApi } = await import('../../admin/api/adminApi');
    const data = await updateApi(managerUser.token, profileData);
    const updatedUser = { ...data, token: managerUser.token };
    setManagerUser(updatedUser);
    localStorage.setItem('sathiGro_manager', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <StoreManagerAuthContext.Provider value={{ managerUser, managerLogin, managerLogout, managerUpdateProfile }}>
      {children}
    </StoreManagerAuthContext.Provider>
  );
};
