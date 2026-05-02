// src/utils/auth.js
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?._id || null;
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return !!getAuthToken() && !!getCurrentUserId();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("currentUser");
};