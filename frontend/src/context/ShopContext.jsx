import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Cache manager with TTL (Time-To-Live) support
const cacheManager = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const { value, expiry } = JSON.parse(item);
      return expiry > Date.now() ? value : null;
    } catch {
      return null;
    }
  },
  set: (key, value, ttl = 3600000) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        value,
        expiry: Date.now() + ttl,
      })
    );
  },
  clear: (key) => {
    localStorage.removeItem(key);
  },
  clearAll: () => {
    localStorage.clear();
  },
};

export const ShopContext = createContext();

export const ShopContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const productCache = useRef({});

  const [state, setState] = useState(() => ({
    products: cacheManager.get("products") || [],
    cartItems: cacheManager.get("cart") || {},
    customizableProducts: cacheManager.get("customizableProducts") || [],
    token: cacheManager.get("token") || "",
    refreshToken: cacheManager.get("refreshToken") || "",
    search: "",
    showSearch: false,
    discount: 0,
    smallNav: ["Home"],
    page: 1,
    hasMore: true,
    loading: false,
  }));

  // Token management
  const persistTokens = (token, refreshToken) => {
    cacheManager.set("token", token, 3600000); // 1 hour expiry
    cacheManager.set("refreshToken", refreshToken, 604800000); // 7 days expiry
    setState((prev) => ({ ...prev, token, refreshToken }));
  };

  const clearAuth = () => {
    cacheManager.clear("token");
    cacheManager.clear("refreshToken");
    setState((prev) => ({ ...prev, token: "", refreshToken: "" }));
  };

  // Axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = state.refreshToken || cacheManager.get("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");
            
            const { data } = await axios.post(`${backendUrl}/api/auth/refresh`, {
              refreshToken,
            });
            
            persistTokens(data.token, data.refreshToken);
            originalRequest.headers.token = data.token;
            return axios(originalRequest);
          } catch (refreshError) {
            clearAuth();
            navigate("/login");
            toast.error("Session expired. Please login again");
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [state.refreshToken, navigate, backendUrl]);

  // Cart operations
  const updateCart = async (updater) => {
    setState((prev) => {
      const newCart = typeof updater === "function" ? updater(prev.cartItems) : updater;
      cacheManager.set("cart", newCart, 1800000); // 30 mins cache
      
      // Sync with server if authenticated
      if (state.token) {
        axios
          .post(
            `${backendUrl}/api/cart/sync`,
            { cartData: newCart },
            { headers: { token: state.token } }
          )
          .catch(console.error);
      }
      
      return { ...prev, cartItems: newCart };
    });
  };

  const addToCart = (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    updateCart((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [size]: ((prev[itemId]?.[size] || 0) + 1),
      },
    }));
  };

  const removeFromCart = (itemId, size) => {
    updateCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId]?.[size]) {
        delete newCart[itemId][size];
        if (Object.keys(newCart[itemId]).length === 0) {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId, size, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId, size);
      return;
    }

    updateCart((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [size]: quantity,
      },
    }));
  };

  const clearCart = () => {
    updateCart({});
  };

  // Product fetching
  const getProductsData = async (page, forceRefresh = false) => {
    const cacheKey = `products_page_${page}`;
    
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        setState((prev) => ({
          ...prev,
          products: mergeProducts(prev.products, cached),
        }));
        return;
      }
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`, {
        params: { page, limit: 8 },
      });

      if (data.success) {
        const newProducts = data.products.filter((p) => !p.customizable);
        cacheManager.set(cacheKey, newProducts);
        productCache.current[cacheKey] = newProducts;

        setState((prev) => ({
          ...prev,
          products: mergeProducts(prev.products, newProducts),
          hasMore: data.hasMore,
          loading: false,
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch products");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const getCustomizableProductsData = async () => {
    const cached = cacheManager.get("customizableProducts");
    if (cached) {
      setState((prev) => ({ ...prev, customizableProducts: cached }));
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`, {
        params: { custom: true },
      });

      if (data.success) {
        const filtered = data.products.filter((p) => p.isCustomizable);
        cacheManager.set("customizableProducts", filtered);
        setState((prev) => ({ ...prev, customizableProducts: filtered }));
      }
    } catch (error) {
      toast.error("Failed to fetch customizable products");
    }
  };

  // User authentication
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
      });

      if (data.success) {
        persistTokens(data.token, data.refreshToken);
        await getUserCart(data.token);
        toast.success("Login successful");
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    clearAuth();
    clearCart();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const getUserCart = async (userToken) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: userToken } }
      );

      if (data.success) {
        updateCart(data.cartData);
      }
    } catch (error) {
      console.error("Failed to fetch user cart:", error);
    }
  };

  // Search functionality
  const setSearchQuery = (query) => {
    setState((prev) => ({ ...prev, search: query }));
  };

  const toggleSearch = () => {
    setState((prev) => ({ ...prev, showSearch: !prev.showSearch }));
  };

  // Helper functions
  const mergeProducts = (existing, newItems) => {
    const existingIds = new Set(existing.map((p) => p._id));
    const filtered = newItems.filter((p) => !existingIds.has(p._id));
    return [...existing, ...filtered];
  };

  const getCartCount = () => {
    return Object.values(state.cartItems).reduce(
      (total, sizes) => total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  const getCartAmount = () => {
    return Object.entries(state.cartItems).reduce((total, [itemId, sizes]) => {
      const allProducts = [...state.products, ...state.customizableProducts];
      const itemInfo = allProducts.find((product) => product._id === itemId);
      if (!itemInfo) return total;
      return (
        total +
        Object.values(sizes).reduce((sum, qty) => sum + qty * itemInfo.price, 0)
      );
    }, 0);
  };

  // Initialize
  useEffect(() => {
    if (!state.products.length) getProductsData(1);
    getCustomizableProductsData();
  }, []);

  useEffect(() => {
    if (state.token) {
      getUserCart(state.token);
    }
  }, [state.token]);

  return (
    <ShopContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getProductsData,
        getCustomizableProductsData,
        login,
        logout,
        setSearchQuery,
        toggleSearch,
        getCartCount,
        getCartAmount,
        updateCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};