import { createContext, useEffect, useRef, useState, useCallback } from "react";
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

const ShopContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const delivery_fee = Number(import.meta.env.VITE_DELIVERY_FEE);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP;
  // const discountPercentage = Number(import.meta.env.FIRST_ORDER_DISCOUNT || 0);
  const navigate = useNavigate();
  const productCache = useRef({});

  const [state, setState] = useState(() => ({
    user: null,
    cartCount: 0,
    loadingUser: false,
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
    applyingDiscount: false,
    orders: cacheManager.get("orders") || [],
    loadingOrders: cacheManager.get("orders")?.length === 0, // Only load if no cached orders
    currentOrderPage: 1,
    hasMoreOrders: true,
  }));

  // Token management
  const persistTokens = useCallback((token, refreshToken) => {
    cacheManager.set("token", token, 3600000); // 1 hour expiry
    cacheManager.set("refreshToken", refreshToken, 604800000); // 7 days expiry
    setState((prev) => ({ ...prev, token, refreshToken }));
  }, []);

  const clearAuth = useCallback(() => {
    cacheManager.clear("token");
    cacheManager.clear("refreshToken");
    setState((prev) => ({
      ...prev,
      token: "",
      refreshToken: "",
      user: null,
      cartCount: 0,
    }));
  }, []);

  // User info fetcher
  const fetchUserInfo = useCallback(async () => {
    if (!state.token) {
      setState((prev) => ({ ...prev, user: null, cartCount: 0 }));
      return;
    }

    setState((prev) => ({ ...prev, loadingUser: true }));
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/userInfo`,
        {},
        {
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );

      if (response.data?.success) {
        setState((prev) => ({
          ...prev,
          user: response.data,
          cartCount: response.data.cartCount || 0,
          loadingUser: false,
        }));
      }
    } catch (error) {
      // toast.error(error?.response?.data?.message || "Failed to load user info");
      setState((prev) => ({ ...prev, loadingUser: false }));
      if (error.response?.status === 401) {
        clearAuth();
      }
    }
  }, [state.token, backendUrl, clearAuth]);

  // Axios response interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken =
              state.refreshToken || cacheManager.get("refreshToken");
            if (!refreshToken) throw new Error("No refresh token");

            const { data } = await axios.post(
              `${backendUrl}/api/auth/refresh`,
              { refreshToken }
            );

            persistTokens(data.token, data.refreshToken);
            originalRequest.headers.authorization = `Bearer ${data.token}`;
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
  }, [state.refreshToken, navigate, backendUrl, persistTokens, clearAuth]);

  // Cart operations
  const updateCart = useCallback(
    async (updater) => {
      setState((prev) => {
        const newCart =
          typeof updater === "function" ? updater(prev.cartItems) : updater;

        // Calculate new cart count
        const newCartCount = Object.values(newCart).reduce(
          (total, sizes) =>
            total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
          0
        );

        cacheManager.set("cart", newCart, 1800000);

        if (state.token) {
          axios
            .post(
              `${backendUrl}/api/cart/update`,
              { cartData: newCart },
              {
                headers: { Authorization: `Bearer ${state.token}` },
              }
            )
            .catch((error) => {
              // if (error.response?.status === 401) {
              // Handle token expiration
              // console.log("Token expired, redirect to login");
              // toast.error("Token expired, redirect to login");
              // }
              // toast.error("Cart update failed");
            });
        }

        return { ...prev, cartItems: newCart, cartCount: newCartCount };
      });
    },
    [state.token, backendUrl]
  );

  const addToCart = useCallback(
    (itemId, size) => {
      if (!size) {
        toast.error("Please select a size");
        return;
      }

      updateCart((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          [size]: (prev[itemId]?.[size] || 0) + 1,
        },
      }));
    },
    [updateCart]
  );

  const removeFromCart = useCallback(
    (itemId, size) => {
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
    },
    [updateCart]
  );

  const updateQuantity = useCallback(
    (itemId, size, quantity) => {
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
    },
    [updateCart, removeFromCart]
  );

  const clearCart = useCallback(() => {
    updateCart({});
  }, [updateCart]);

  const setDiscount = useCallback((value) => {
    setState((prev) => ({ ...prev, discount: value }));
  }, []);

  const setApplyingDiscount = useCallback((value) => {
    setState((prev) => ({ ...prev, applyingDiscount: value }));
  }, []);

  // Add the discount verification function
  const verifyDiscountCode = useCallback(
    async (couponCode) => {
      if (!state.token) {
        toast.error("Please login to apply discount");
        return 0;
      }

      setApplyingDiscount(true);
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/order/verifyCode`,
          { couponCode },
          {
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          }
        );

        if (data.success && data.discount) {
          setDiscount(data.discount);
          return data.discount;
        }

        toast.error(data.message || "Invalid discount code");
        return 0;
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "Failed to apply discount";
        toast.error(errorMessage);
        return 0;
      } finally {
        setApplyingDiscount(false);
      }
    },
    [state.token, backendUrl, setDiscount, setApplyingDiscount]
  );

  // Product fetching
  const getProductsData = useCallback(
    async (page = 1, forceRefresh = false) => {
      const cacheKey = `products_page_${page}`;

      // Only use cache if not forcing refresh
      if (!forceRefresh) {
        const cached = cacheManager.get(cacheKey);
        if (cached) {
          setState((prev) => ({
            ...prev,
            products: mergeProducts(prev.products, cached),
            loading: false,
          }));
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const { data } = await axios.get(`${backendUrl}/api/product/list`, {
          params: {
            page,
            limit: 8, // Match your default limit
          },
        });

        if (data.success) {
          const newProducts = data.products.filter((p) => !p.customizable);
          cacheManager.set(cacheKey, newProducts);
          productCache.current[cacheKey] = newProducts;

          setState((prev) => ({
            ...prev,
            products:
              page === 1
                ? newProducts
                : mergeProducts(prev.products, newProducts),
            hasMore: data.hasMore,
            loading: false,
            page,
          }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
        // toast.error(
        //   error.response?.data?.message || "Failed to fetch products"
        // );
      }
    },
    [backendUrl]
  );

  const getCustomizableProductsData = useCallback(async () => {
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
        const filtered = data.products.filter((p) => p.customizable);
        cacheManager.set("customizableProducts", filtered);
        setState((prev) => ({ ...prev, customizableProducts: filtered }));
      }
    } catch (error) {
      // toast.error("Failed to fetch customizable products");
    }
  }, [backendUrl]);

  const toggleSearch = useCallback((forceState) => {
    setState((prev) => ({
      ...prev,
      showSearch:
        typeof forceState === "boolean" ? forceState : !prev.showSearch,
    }));
  }, []);

  const getUserCart = useCallback(
    async (userToken) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );

        if (data.success) {
          updateCart(data.cartData);
        }
      } catch (error) {
        // toast.error("Failed to fetch user cart");
      }
    },
    [backendUrl, updateCart]
  );

  // Helper functions
  const mergeProducts = (existing, newItems) => {
    // Ensure existing is always treated as an array
    const safeExisting = Array.isArray(existing) ? existing : [];
    const existingIds = new Set(safeExisting.map((p) => p._id));
    const filtered = Array.isArray(newItems)
      ? newItems.filter((p) => !existingIds.has(p._id))
      : [];
    return [...safeExisting, ...filtered];
  };

  const getCartAmount = useCallback(() => {
    return Object.entries(state.cartItems).reduce((total, [itemId, sizes]) => {
      const allProducts = [...state.products, ...state.customizableProducts];
      const itemInfo = allProducts.find((product) => product._id === itemId);
      if (!itemInfo) return total;
      return (
        total +
        Object.values(sizes).reduce((sum, qty) => sum + qty * itemInfo.price, 0)
      );
    }, 0);
  }, [state.cartItems, state.products, state.customizableProducts]);

  const fetchOrders = useCallback(
    async (forceRefresh = false) => {
      // Prevent multiple simultaneous requests
      if (state.loadingOrders) return;
      // Get token from state or localStorage as fallback
      const token = state.token || cacheManager.get("token");
      if (!token) {
        // console.error("No token available");
        return;
      }

      const cacheKey = "userOrders";
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes cache

      // Check cache if not forcing refresh
      if (!forceRefresh) {
        const cachedOrders = cacheManager.get(cacheKey);
        if (cachedOrders) {
          setState((prev) => ({ ...prev, orders: cachedOrders }));
          return;
        }
      }

      setState((prev) => ({ ...prev, loadingOrders: true }));

      try {
        const response = await axios.post(
          `${backendUrl}/api/order/userorders`,
          { page: forceRefresh ? 1 : state.currentOrderPage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          const orders = response.data.orders;
          cacheManager.set(cacheKey, orders, cacheExpiry);
          setState((prev) => ({
            ...prev,
            orders: forceRefresh ? orders : [...prev.orders, ...orders],
            hasMoreOrders: response.data.hasMore,
            loadingOrders: false,
          }));
        }
      } catch (error) {
        // console.error(
        //   "Order fetch error:",
        //   error.response?.data || error.message
        // );
        setState((prev) => ({ ...prev, loadingOrders: false }));

        if (error.response?.status === 401) {
          // Clear invalid token and redirect to login
          cacheManager.clear("token");
          setState((prev) => ({ ...prev, token: "" }));
          toast.error("Session expired. Please login again");
          navigate("/login");
        }
        // else {
        //   toast.error(error.response?.data?.message || "Failed to load orders");
        // }
      }
    },
    [backendUrl, state.currentOrderPage, navigate]
  );

  const refreshOrders = useCallback(() => {
    return fetchOrders(true); // Force refresh
  }, [fetchOrders]);

  const getOrderById = useCallback(
    (orderId) => {
      return state.orders.find((order) => order._id === orderId);
    },
    [state.orders]
  );

  const clearOrders = useCallback(() => {
    cacheManager.clear("userOrders");
    setState((prev) => ({
      ...prev,
      orders: [],
    }));
  }, []);

  // User authentication
  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          {
            email,
            password,
          },
          {
            // Prevent axios from throwing errors for 401 responses
            validateStatus: (status) => status < 500,
          }
        );

        if (data.success) {
          persistTokens(data.token, data.refreshToken);
          await getUserCart(data.token);
          await fetchUserInfo();
          toast.success("Login successful");
          return true;
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
        return false;
      }
    },
    [backendUrl, persistTokens, fetchUserInfo]
  );

  const logout = useCallback(async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        {
          // Prevent axios from throwing errors for 401 responses
          validateStatus: (status) => status < 500,
        }
      );

      if (response.status == 204) {
        clearAuth();
        clearCart();
        clearOrders();
        navigate("/login");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Logout failed");
      return false;
    }
  }, [clearAuth, clearCart, navigate, clearOrders]);

  // Initialize
  useEffect(() => {
    if (!state.products?.length) getProductsData(1);
    getCustomizableProductsData();
    if (state.token) {
      fetchUserInfo();
    }
  }, [
    state.token,
    getProductsData,
    getCustomizableProductsData,
    fetchUserInfo,
  ]);

  return (
    <ShopContext.Provider
      value={{
        ...state,
        backendUrl,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getProductsData,
        getCustomizableProductsData,
        login,
        logout,
        setSearchQuery: (query) =>
          setState((prev) => ({ ...prev, search: query })),
        toggleSearch,
        getCartAmount,
        updateCart,
        navigate,
        delivery_fee,
        currency,
        whatsappNumber,
        setDiscount,
        verifyDiscountCode,
        orders: state.orders,
        loadingOrders: state.loadingOrders,
        fetchOrders,
        refreshOrders,
        getOrderById,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
