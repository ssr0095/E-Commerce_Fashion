import { createContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const delivery_fee = Number(import.meta.env.VITE_DELIVERY_FEE);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cartItems");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem("products");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customizableProducts, setCustomizableProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [discount, setDiscount] = useState(0);
  const [smallNav, setSmallNav] = useState(["Home"]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const productCache = useRef({});

  const navigate = useNavigate();

  const persistCart = (cartData) => {
    setCartItems(cartData);
    localStorage.setItem("cartItems", JSON.stringify(cartData));
  };

  const persistProducts = (updatedProducts, page) => {
    const pages = Object.entries(productCache.current).map(([key, data]) => ({
      key,
      data,
    }));
    localStorage.setItem(
      "cached_products",
      JSON.stringify({ allProducts: updatedProducts, pages })
    );
  };

  const persistToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Select Product Size");

    let cartData = structuredClone(cartItems);

    cartData[itemId] = cartData[itemId] || {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    persistCart(cartData);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to add item to cart"
        );
      }
    }
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((total, sizes) => {
      return total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const userInfo = async () => {
    if (token) {
      try {
        return await axios.post(
          `${backendUrl}/api/user/userInfo`,
          {},
          { headers: { token } }
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to fetch user info"
        );
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;

    persistCart(cartData);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to update quantity"
        );
      }
    }
  };

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
      const itemInfo = products.find((product) => product._id === itemId);
      if (!itemInfo) return total;
      return (
        total +
        Object.values(sizes).reduce((sum, qty) => sum + qty * itemInfo.price, 0)
      );
    }, 0);
  };

  const getProductsData = async (page) => {
    const cacheKey = `page_${page}`;

    // Use cache if available
    if (productCache.current[cacheKey]) {
      const cachedProducts = productCache.current[cacheKey];
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const filtered = cachedProducts.filter((p) => !existingIds.has(p._id));
        const updated = [...prev, ...filtered];
        persistProducts(updated); // Persist updated list
        return updated;
      });
      return;
    }

    try {
      const res = await axios.get(
        `${backendUrl}/api/product/list?page=${page}&limit=8`
      );

      if (res.data.success) {
        const newProducts = res.data.products;

        // Save to cache
        productCache.current[cacheKey] = newProducts;

        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const filtered = newProducts.filter((p) => !existingIds.has(p._id));
          const updated = [...prev, ...filtered];
          persistProducts(updated); // Persist updated list
          return updated;
        });

        setHasMore(res.data.hasMore);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    }
  };

  const getCustomizableProductsData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/list?custom=true`);
      if (res.data.success) {
        setCustomizableProducts((prev) => [...prev, ...res.data.products]);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch customizable products"
      );
    }
  };

  const getUserCart = async (userToken) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        { headers: { token: userToken } }
      );
      if (res.data.success) {
        persistCart(res.data.cartData);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to get user cart");
    }
  };

  const isDiscount = async (couponCode) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/verifyCode`,
        { couponCode },
        { headers: { token } }
      );
      if (res.data.success) {
        const dis = import.meta.env.VITE_DISCOUNT;
        setDiscount(dis);
        return dis;
      }
      return res.data.message;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid discount code");
    }
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cached_products"));
    if (stored) {
      setProducts(stored.allProducts || []);
      if (stored.pages) {
        stored.pages.forEach(({ key, data }) => {
          productCache.current[key] = data;
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!products.length) getProductsData(page);
    getCustomizableProductsData();
    if (token) userInfo();
  }, []);

  useEffect(() => {
    if (token) {
      persistToken(token);
      getUserCart(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems: persistCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    getProductsData,
    getCustomizableProductsData,
    customizableProducts,
    setCustomizableProducts,
    navigate,
    backendUrl,
    setToken: persistToken,
    token,
    discount,
    setDiscount,
    isDiscount,
    userInfo,
    smallNav,
    setSmallNav,
    page,
    setPage,
    hasMore,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
