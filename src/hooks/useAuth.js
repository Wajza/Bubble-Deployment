// frontend/src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { getCurrentUser, getAuthToken, logout as logoutService } from "../services/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    
    if (token && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    await logoutService();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    loadUser();
    
    const handleStorageChange = () => loadUser();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("logout", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleStorageChange);
    };
  }, [loadUser]);

  return { user, isAuthenticated, loading, logout, refreshUser: loadUser };
};