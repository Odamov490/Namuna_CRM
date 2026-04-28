import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, userService, alertService } from '../lib/firebase.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts]           = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState([]);

  // Auth listener
  useEffect(() => {
    const unsub = authService.onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let profile = await userService.getProfile(firebaseUser.uid);
        if (!profile) {
          await userService.createProfile(firebaseUser.uid, {
            displayName: firebaseUser.displayName || 'Foydalanuvchi',
            email: firebaseUser.email,
            role: 'observer',
            labId: null,
          });
          profile = await userService.getProfile(firebaseUser.uid);
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Unread alerts subscription (only for logged-in users)
  useEffect(() => {
    if (!user) { setUnreadAlerts([]); return; }
    const unsub = alertService.subscribeToUnread(setUnreadAlerts);
    return unsub;
  }, [user]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await userService.getProfile(user.uid);
    setUserProfile(p);
  }, [user]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setUserProfile(null);
  }, []);

  const isSuperAdmin = userProfile?.role === 'super_admin';
  const isLabManager = userProfile?.role === 'lab_manager' || isSuperAdmin;
  const isTechnician = userProfile?.role === 'technician' || isLabManager;
  const canEdit      = isTechnician;
  const canScan      = isTechnician;

  return (
    <AppContext.Provider value={{
      user, userProfile, authLoading,
      toasts, unreadAlerts,
      isSuperAdmin, isLabManager, isTechnician, canEdit, canScan,
      showToast, logout, refreshProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
