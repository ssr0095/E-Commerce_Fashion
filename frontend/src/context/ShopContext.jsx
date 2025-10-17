import {
  createContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

//#region HELPERS

const cacheManager = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, expiry, timestamp } = JSON.parse(item);

      // Auto-clean expired items
      if (expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch {
      localStorage.removeItem(key); // Clear corrupted data
      return null;
    }
  },

  set: (key, value, ttl = 259200000) => {
    // 3 days
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
      };

      // Simple compression for large data
      const compressed = JSON.stringify(item);
      if (compressed.length > 5000000) {
        // 5MB limit
        console.warn(`Cache item ${key} too large: ${compressed.length} bytes`);
        return;
      }

      localStorage.setItem(key, compressed);
    } catch (error) {
      console.warn(`Failed to cache ${key}:`, error);
    }
  },

  clear: (key) => {
    localStorage.removeItem(key);
  },

  clearExpired: () => {
    Object.keys(localStorage).forEach((key) => {
      cacheManager.get(key);
    });
  },
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const withRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const fetchWithRetry = async (url, options = {}) => {
  return withRetry(() =>
    axios({
      ...options,
      url,
      timeout: 10000,
    })
  );
};

//#endregion

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const delivery_fee = Number(import.meta.env.VITE_DELIVERY_FEE);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP;
  // const discountPercentage = Number(import.meta.env.FIRST_ORDER_DISCOUNT || 0);
  const navigate = useNavigate();
  // const productCache = useRef({});
  const requestQueue = useRef(new Map());

  const [state, setState] = useState(() => ({
    user: null,
    cartCount: 0,
    loadingUser: false,
    products: cacheManager.get("products") || [],
    cartItems: cacheManager.get("cart") || {},
    customizableProducts: cacheManager.get("customizableProducts") || [],
    bestSellerProducts: cacheManager.get("bestSellerProducts") || [],
    latestProducts: cacheManager.get("latestProducts") || [],
    token: cacheManager.get("accessToken") || "",
    search: "",
    showSearch: false,
    discount: 0,
    smallNav: ["Home"],
    page: 1,
    hasMore: true,
    totalPages: 0,
    currentPage: 0,
    loading: false,
    applyingDiscount: false,
    orders: cacheManager.get("orders") || [],
    loadingOrders: cacheManager.get("orders")?.length === 0, // Only load if no cached orders
    currentOrderPage: 1,
    hasMoreOrders: true,
    filters: {
      category: [],
      subCategory: [],
      theme: [],
      sortBy: "newest",
      search: "",
    },
    filterOptions: {
      categories: [],
      subCategories: [],
      themes: [],
    },
  }));

  //#region Token management

  const persistToken = useCallback((token) => {
    cacheManager.set("accessToken", token, 1800000); // Reduced to 30 min for security
    setState((prev) => ({ ...prev, token }));
  }, []);

  const clearAuth = useCallback(() => {
    cacheManager.clear("accessToken");
    setState((prev) => ({
      ...prev,
      token: "",
      user: null,
      cartCount: 0,
    }));
  }, []);

  //#endregion

  //#region AUTH MANAGENT

  const fetchUserInfo = useCallback(async () => {
    if (!state.token) {
      setState((prev) => ({ ...prev, user: null, cartCount: 0 }));
      return;
    }
    setState((prev) => ({ ...prev, loadingUser: true }));
    try {
      const response = await fetchWithRetry(`${backendUrl}/api/user/userInfo`, {
        method: "POST",
        data: {},
        headers: {
          Authorization: `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log(response);
      if (response.data?.success) {
        setState((prev) => ({
          ...prev,
          user: response.data,
          cartCount: response.data.cartCount || 0,
          loadingUser: false,
        }));
      } else console.log("error fetching user info");
    } catch (error) {
      toast.error(error?.message || "Failed to load user info");
      setState((prev) => ({ ...prev, loadingUser: false }));
      if (error?.status === 401) {
        clearAuth();
        navigate("/login");
      }
    }
  }, [state.token, backendUrl, clearAuth]);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = state.token || cacheManager.get("accessToken");
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        navigate("/login");
        return false;
      }

      // Verify token validity
      const response = await axios.post(
        `${backendUrl}/api/auth/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.valid) {
        // Token is valid, ensure user data is fresh
        await fetchUserInfo();
      } else {
        // Token invalid, try refresh
        await refreshToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      await refreshToken(); // Try refresh on any error
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.token, backendUrl, fetchUserInfo, navigate]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data?.accessToken) {
        persistToken(response.data.accessToken);
        await fetchUserInfo();
        return true;
      }
      throw new Error("Refresh failed");
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuth();
      navigate("/login");
      toast.error("Session expired. Please login again");
      return false;
    }
  }, [backendUrl, persistToken, fetchUserInfo, clearAuth, navigate]);

  //#endregion

  //#region CART MANAGENT

  const calculateCartCount = (newCart) => {
    return Object.values(newCart).reduce(
      (total, sizes) =>
        total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  const sendCartUpdate = useCallback(
    debounce(async (cartData) => {
      if (!state.token) return;

      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { cartData },
          {
            headers: { Authorization: `Bearer ${state.token}` },
            timeout: 5000,
          }
        );
      } catch (error) {
        if (error?.response?.status === 401) {
          await refreshToken();
        }
      }
    }, 1000),
    [state.token, backendUrl, refreshToken]
  );

  const updateCart = useCallback(
    async (updater) => {
      const requestId = Date.now().toString();

      setState((prev) => {
        const newCart =
          typeof updater === "function" ? updater(prev.cartItems) : updater;
        const newCartCount = calculateCartCount(newCart);

        cacheManager.set("cart", newCart);

        // Queue the API call
        requestQueue.current.set(requestId, { newCart, requestId });

        setTimeout(() => {
          if (requestQueue.current.has(requestId)) {
            sendCartUpdate(newCart);
            requestQueue.current.delete(requestId);
          }
        }, 500); // Batch updates

        return { ...prev, cartItems: newCart, cartCount: newCartCount };
      });
    },
    [state.token, backendUrl, sendCartUpdate]
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

  const getUserCart = useCallback(
    async (userToken) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
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

  //#endregion

  //#region DISCOUNT MANAGENT
  const setDiscount = useCallback((value) => {
    setState((prev) => ({ ...prev, discount: value }));
  }, []);

  const setApplyingDiscount = useCallback((value) => {
    setState((prev) => ({ ...prev, applyingDiscount: value }));
  }, []);

  const verifyDiscountCode = useCallback(
    async (couponCode) => {
      if (!state.token) {
        toast.error("Please login to apply discount");
        navigate("/login");
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
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (data.success && data.discount) {
          setDiscount(data.discount);
          return data.discount;
        }

        toast.error(data.message || data || "Invalid discount code");
        return 0;
      } catch (error) {
        if (error?.status === 401) {
          clearAuth();
          navigate("/login");
        }
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

  //#endregion

  //#region PRODUCT MANAGENT

  const getProductsData = useCallback(
    async (page = 1, forceRefresh = false, appliedFilters = {}) => {
      const currentFilters = { ...state.filters, ...appliedFilters };
      const cacheKey = `products_${JSON.stringify(
        currentFilters
      )}_page_${page}`;

      if (state.loading) return;

      // Check cache
      if (!forceRefresh) {
        const cached = cacheManager.get(cacheKey);
        if (cached) {
          setState((prev) => ({
            ...prev,
            products:
              page === 1
                ? cached.products
                : [...prev.products, ...cached.products],
            hasMore: cached.hasMore,
            loading: false,
            page,
            currentPage: cached.currentPage || page, // Add this
            totalPages: cached.totalPages || 1, // Add this
            filterOptions: cached.filterOptions || prev.filterOptions,
          }));
          return;
        }
      }

      setState((prev) => ({ ...prev, loading: true }));

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          sortBy: currentFilters.sortBy,
        });

        // Add filters to params
        if (currentFilters.category.length > 0) {
          currentFilters.category.forEach((cat) =>
            params.append("category", cat)
          );
        }
        if (currentFilters.subCategory.length > 0) {
          currentFilters.subCategory.forEach((sub) =>
            params.append("subCategory", sub)
          );
        }
        if (currentFilters.theme.length > 0) {
          currentFilters.theme.forEach((th) => params.append("theme", th));
        }
        if (currentFilters.search) {
          params.append("search", currentFilters.search);
        }

        const { data } = await axios.get(
          `${backendUrl}/api/product/list?${params}`
        );

        if (data.success) {
          const cacheData = {
            products: data.products,
            hasMore: data.hasMore,
            currentPage: data.currentPage, // Make sure backend returns this
            totalPages: data.totalPages, // Make sure backend returns this
            filterOptions: data.availableFilters,
          };

          cacheManager.set(cacheKey, cacheData);

          setState((prev) => ({
            ...prev,
            products:
              // page === 1 ? data.products : [...prev.products, ...data.products],
              data.products,
            hasMore: data.hasMore,
            loading: false,
            page,
            currentPage: data.currentPage || page, // Add this
            totalPages: data.totalPages || 1, // Add this
            filterOptions: data.availableFilters,
          }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
        if (error.code === "ECONNABORTED") {
          toast.error("Request timeout. Please try again.");
        }
      }
    },
    [backendUrl, state.loading, state.filters]
  );

  const updateFilters = useCallback(
    async (newFilters, resetPagination = true) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      // setFilters(updatedFilters);
      setState((prev) => ({
        ...prev,
        filters: updatedFilters,
      }));

      if (resetPagination) {
        await getProductsData(1, true, updatedFilters);
      }
    },
    [state.filters, getProductsData]
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

  const getBestSellerProductsData = useCallback(async () => {
    const cached = cacheManager.get("bestSellerProducts");
    if (cached) {
      setState((prev) => ({ ...prev, bestSellerProducts: cached }));
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`, {
        params: { bestSeller: true },
      });

      if (data.success) {
        const filtered = data.products.filter((p) => p.bestseller);
        cacheManager.set("bestSellerProducts", filtered);
        setState((prev) => ({ ...prev, bestSellerProducts: filtered }));
      }
    } catch (error) {
      // toast.error("Failed to fetch customizable products");
    }
  }, [backendUrl]);

  const getlatestProductsProductsData = useCallback(async () => {
    const cached = cacheManager.get("latestProducts");
    if (cached) {
      setState((prev) => ({ ...prev, latestProducts: cached }));
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);

      if (data.success) {
        cacheManager.set("latestProducts", data.products);
        setState((prev) => ({ ...prev, latestProducts: data.products }));
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

  // const mergeProducts = (existing, newItems) => {
  //   // Ensure existing is always treated as an array
  //   const safeExisting = Array.isArray(existing) ? existing : [];
  //   const existingIds = new Set(safeExisting.map((p) => p._id));
  //   const filtered = Array.isArray(newItems)
  //     ? newItems.filter((p) => !existingIds.has(p._id))
  //     : [];
  //   return [...safeExisting, ...filtered];
  // };

  //#endregion

  //#region ORDER MANAGENT

  const fetchOrders = useCallback(
    async (forceRefresh = false) => {
      // Prevent multiple simultaneous requests
      if (state.loadingOrders) return;

      const token = state.token || cacheManager.get("accessToken");
      if (!token) {
        navigate("/login");
        // console.error("No token available");
        return;
      }

      const cacheKey = "userOrders";
      const cacheExpiry = 2 * 60 * 1000; // 5 minutes cache

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
        const response = await fetchWithRetry(
          `${backendUrl}/api/order/userorders`,
          {
            method: "POST",
            data: { page: forceRefresh ? 1 : state.currentOrderPage },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
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

        if (error?.status === 401) {
          clearAuth();
          toast.error("Session expired. Please login again");
          navigate("/login");
        } else {
          toast.error(
            error.data?.message || error?.message || "Failed to load orders"
          );
        }
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

  //#endregion

  //#region AUTH MANAGENT

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
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (data.success) {
          persistToken(data.user.accessToken);
          await getUserCart(data.user.accessToken);
          await fetchUserInfo();
          toast.success("Login successful");
          // navigate("/");
          return true;
        } else {
          if (data?.message) toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.message || "Login failed");
        return false;
      }
    },
    [backendUrl, persistToken, fetchUserInfo]
  );

  const register = useCallback(
    async (name, email, password) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          {
            name,
            email,
            password,
          },
          {
            // Prevent axios from throwing errors for 401 responses
            validateStatus: (status) => status < 500,
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (data.success) {
          persistToken(data.user.accessToken);
          await getUserCart(data.user.accessToken);
          await fetchUserInfo();
          toast.success("Sign up successful");
          // navigate('/');
          return true;
        } else {
          if (data?.message) toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.message || "Sign up failed");
        return false;
      }
    },
    [backendUrl, persistToken, fetchUserInfo]
  );

  const googleLogin = useCallback(
    async (googleData) => {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/google`,
          JSON.stringify(googleData),
          {
            // Prevent axios from throwing errors for 401 responses
            validateStatus: (status) => status < 500,
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        if (data.success && data.user.accessToken) {
          persistToken(data.user.accessToken);
          await getUserCart(data.user.accessToken);
          await fetchUserInfo();
          toast.success("Login successful");
          // navigate("/");
          return true;
        } else {
          if (data?.message) toast.error(data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error(error?.message || "Login failed");
        return false;
      }
    },
    [backendUrl, persistToken, fetchUserInfo]
  );

  const logout = useCallback(async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        {
          // Prevent axios from throwing errors for 401 responses
          validateStatus: (status) => status < 500,
          withCredentials: true,
        }
      );

      if (response.status == 204) {
        clearAuth();
        // clearCart();
        clearOrders();
        // navigate("/");
        window.location.href = "/";
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Logout failed");
      return false;
    }
  }, [clearAuth, navigate, clearOrders]);

  //#endregion

  //#region APP INITIALIZE MANAGENT

  useEffect(() => {
    // Clear expired cache on app start
    cacheManager.clearExpired();

    // Initialize auth and data
    const initApp = async () => {
      const token = state.token || cacheManager.get("accessToken");
      if (token) await checkAuthStatus();
      await Promise.all([
        getProductsData(1),
        getCustomizableProductsData(),
        getBestSellerProductsData(),
        getlatestProductsProductsData(),
      ]);
    };

    initApp();
  }, []);

  useEffect(() => {
    return () => {
      requestQueue.current.clear();
    };
  }, []);

  //#endregion

  const contextValue = useMemo(
    () => ({
      ...state,
      backendUrl,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getProductsData,
      getCustomizableProductsData,
      getBestSellerProductsData,
      getlatestProductsProductsData,
      login,
      register,
      googleLogin,
      logout,
      setSearchQuery: (query) =>
        setState((prev) => ({ ...prev, search: query })),

      setLoading: (boolV) => setState((prev) => ({ ...prev, loading: boolV })),
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
      updateFilters,
    }),
    [
      state,
      backendUrl,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getProductsData,
      getCustomizableProductsData,
      getBestSellerProductsData,
      getlatestProductsProductsData,
      login,
      register,
      googleLogin,
      logout,
      toggleSearch,
      getCartAmount,
      updateCart,
      navigate,
      delivery_fee,
      currency,
      whatsappNumber,
      setDiscount,
      verifyDiscountCode,
      fetchOrders,
      refreshOrders,
      getOrderById,
      updateFilters,
    ]
  );

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
