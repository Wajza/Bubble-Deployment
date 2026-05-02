// frontend/src/services/api.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==================== Helper Functions ====================

export const getAuthToken = () => localStorage.getItem("token");

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?._id || null;
};

export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => {});
    }
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    window.dispatchEvent(new Event("storage"));
  }
};

// ==================== Authenticated Fetch ====================

export const authFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ==================== Auth Endpoints ====================

export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Signup failed");
  return data;
};

export const signin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const getUserProfile = async () => authFetch("/auth/profile");

export const updateUserProfile = async (profileData) => 
  authFetch("/auth/profile", { method: "PUT", body: JSON.stringify(profileData) });

export const uploadProfileImage = async (file) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/auth/profile/image`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
};

export const changePassword = async (currentPassword, newPassword) =>
  authFetch("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const verifyToken = async () => authFetch("/auth/verify");

// ==================== Product Endpoints ====================

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const getProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) throw new Error("Product not found");
  return response.json();
};

// ==================== Cart Endpoints ====================

export const getCart = async (userId) => {
  const response = await fetch(`${API_URL}/cart/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
};

export const addToCart = async (data) => authFetch("/cart", { 
  method: "POST", 
  body: JSON.stringify(data) 
});

export const updateCartItem = async (id, quantity) => authFetch(`/cart/${id}`, {
  method: "PUT",
  body: JSON.stringify({ quantity }),
});

export const removeFromCart = async (id) => authFetch(`/cart/${id}`, { method: "DELETE" });

export const clearCart = async (userId) => {
  const cart = await getCart(userId);
  await Promise.all(cart.map(item => removeFromCart(item._id)));
};

// ==================== Wishlist Endpoints ====================

export const getWishlist = async (userId) => {
  const response = await fetch(`${API_URL}/wishlist/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch wishlist");
  return response.json();
};

export const addToWishlist = async (data) => authFetch("/wishlist", { 
  method: "POST", 
  body: JSON.stringify(data) 
});

export const removeFromWishlist = async (id) => authFetch(`/wishlist/${id}`, { method: "DELETE" });

export const updateWishlistItem = async (id, quantity) => authFetch(`/wishlist/${id}`, {
  method: "PUT",
  body: JSON.stringify({ quantity }),
});

// ==================== Order Endpoints ====================

export const createOrder = async (orderData) => authFetch("/orders", { 
  method: "POST", 
  body: JSON.stringify(orderData) 
});

export const getUserOrders = async () => authFetch("/orders/my-orders");

export const getOrderById = async (id) => authFetch(`/orders/${id}`);

// ==================== Review Endpoints ====================

export const getProductReviews = async (productId) => {
  const response = await fetch(`${API_URL}/reviews/product/${productId}`);
  if (!response.ok) throw new Error("Failed to fetch reviews");
  return response.json();
};

export const addReview = async (reviewData) => authFetch("/reviews", { 
  method: "POST", 
  body: JSON.stringify(reviewData) 
});

export const deleteReview = async (id) => authFetch(`/reviews/admin/${id}`, { method: "DELETE" });

// ==================== FAQ Endpoints ====================

export const getFAQs = async () => {
  const response = await fetch(`${API_URL}/faqs`);
  if (!response.ok) throw new Error("Failed to fetch FAQs");
  return response.json();
};

export const createFAQ = async (faqData) => authFetch("/faqs", { 
  method: "POST", 
  body: JSON.stringify(faqData) 
});

export const updateFAQ = async (id, faqData) => authFetch(`/faqs/${id}`, { 
  method: "PUT", 
  body: JSON.stringify(faqData) 
});

export const deleteFAQ = async (id) => authFetch(`/faqs/${id}`, { method: "DELETE" });

// ==================== Ticket Endpoints ====================

export const getTickets = async () => authFetch("/tickets");

export const createTicket = async (ticketData) => authFetch("/tickets", { 
  method: "POST", 
  body: JSON.stringify(ticketData) 
});

export const updateTicket = async (id, ticketData) => authFetch(`/tickets/${id}`, { 
  method: "PUT", 
  body: JSON.stringify(ticketData) 
});

export const deleteTicket = async (id) => authFetch(`/tickets/${id}`, { method: "DELETE" });

// ==================== Custom Options Endpoints ====================

export const getCustomOptions = async () => {
  const response = await fetch(`${API_URL}/custom-options`);
  if (!response.ok) throw new Error("Failed to fetch custom options");
  return response.json();
};

export const updateCustomOption = async (id, data) => authFetch(`/custom-options/${id}`, {
  method: "PUT",
  body: JSON.stringify(data),
});

// ==================== Admin Endpoints ====================

export const getAdminDashboard = async (salesFilter = "all") => {
  const response = await authFetch(`/admin/dashboard?salesFilter=${salesFilter}`);
  return response;
};

export const getAllOrders = async () => authFetch("/admin/orders");

export const updateOrderStatus = async (orderId, status) => 
  authFetch(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const getAllProducts = async () => {
  const response = await fetch(`${API_URL}/admin/products`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const createProduct = async (productData) => {
  const token = getAuthToken();
  const formData = new FormData();
  
  Object.keys(productData).forEach(key => {
    if (key === 'image' && productData.image instanceof File) {
      formData.append('image', productData.image);
    } else if (productData[key] !== undefined && productData[key] !== null) {
      formData.append(key, productData[key]);
    }
  });

  const response = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create product");
  return data;
};

export const updateProduct = async (id, productData) => {
  const token = getAuthToken();
  const formData = new FormData();
  
  Object.keys(productData).forEach(key => {
    if (key === 'image' && productData.image instanceof File) {
      formData.append('image', productData.image);
    } else if (productData[key] !== undefined && productData[key] !== null) {
      formData.append(key, productData[key]);
    }
  });

  const response = await fetch(`${API_URL}/admin/products/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update product");
  return data;
};

export const deleteProduct = async (id) => authFetch(`/admin/products/${id}`, { method: "DELETE" });

export const getAllPromotions = async () => {
  const response = await fetch(`${API_URL}/admin/promotions`);
  if (!response.ok) throw new Error("Failed to fetch promotions");
  return response.json();
};

export const createPromotion = async (promoData) => authFetch("/admin/promotions", { 
  method: "POST", 
  body: JSON.stringify(promoData) 
});

export const deletePromotion = async (id) => authFetch(`/admin/promotions/${id}`, { method: "DELETE" });

export const getAllReviews = async () => authFetch("/reviews/admin/all");

export const getInventory = async () => {
  const response = await fetch(`${API_URL}/admin/inventory`);
  if (!response.ok) throw new Error("Failed to fetch inventory");
  return response.json();
};

export const updateInventory = async (id, stock) => authFetch(`/admin/inventory/${id}`, {
  method: "PUT",
  body: JSON.stringify({ stock }),
});