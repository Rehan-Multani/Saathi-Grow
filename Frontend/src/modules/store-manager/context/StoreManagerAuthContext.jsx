import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin } from '../../../common/api/adminApi';

const StoreManagerAuthContext = createContext();

export const useStoreManagerAuth = () => useContext(StoreManagerAuthContext);

export const StoreManagerAuthProvider = ({ children }) => {
  const [managerUser, setManagerUser] = useState(() => {
    const saved = localStorage.getItem('sathiGro_manager');
    return saved ? JSON.parse(saved) : null;
  });

  const managerLogout = useCallback(() => {
    setManagerUser(null);
    localStorage.removeItem('sathiGro_manager');
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!managerUser?.token) return;
    try {
      const { getProfile } = await import('../../../common/api/adminApi');
      const data = await getProfile(managerUser.token);
      const updatedUser = { ...data, token: managerUser.token };
      setManagerUser(updatedUser);
      localStorage.setItem('sathiGro_manager', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to refresh manager profile:', error);
      if (error.response?.status === 401) {
        managerLogout();
      }
    }
  }, [managerUser?.token, managerLogout]);

  useEffect(() => {
    if (managerUser?.token) {
      refreshProfile();
    }
  }, [refreshProfile]);

  const managerLogin = useCallback(async (email, password) => {
    try {
      const data = await loginAdmin(email, password);
      if (data.role !== 'Store Manager' && data.role !== 'Store Manager') {
        throw new Error('Access denied. This portal is only for Store Managers.');
      }
      setManagerUser(data);
      localStorage.setItem('sathiGro_manager', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const managerUpdateProfile = useCallback(async (profileData) => {
    if (!managerUser?.token) throw new Error('Not authenticated');
    const { updateProfile: updateApi } = await import('../../../common/api/adminApi');
    const data = await updateApi(managerUser.token, profileData);
    const updatedUser = { ...data, token: managerUser.token };
    setManagerUser(updatedUser);
    localStorage.setItem('sathiGro_manager', JSON.stringify(updatedUser));
    return updatedUser;
  }, [managerUser?.token]);

  return (
    <StoreManagerAuthContext.Provider value={{ managerUser, managerLogin, managerLogout, managerUpdateProfile }}>
      {children}
    </StoreManagerAuthContext.Provider>
  );
};
