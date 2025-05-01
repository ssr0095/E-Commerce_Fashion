import { createContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [customizableProducts, setCustomizableProducts] = useState([]);
  const [token, setToken] = useState("");
  const [discount, setDiscount] = useState(0);
  const [smallNav, setSmallNav] = useState(["Home"]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const productCache = useRef({});

  const navigate = useNavigate();

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const userInfo = async () => {
    if (token) {
      try {
        return await axios.post(
          backendUrl + "/api/user/userInfo",
          {},
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async (page) => {
    const cacheKey = `page_${page}`;

    if (productCache.current[cacheKey]) {
      setProducts((prevProducts) => [
        ...prevProducts,
        ...productCache.current[cacheKey],
      ]);
      return;
    }

    try {
      const response = await axios.get(
        `${backendUrl}/api/product/list?page=${page}&limit=8`
      );

      if (response.data.success) {
        const newProducts = response.data.products;

        // Update cache
        productCache.current[cacheKey] = newProducts;

        // Update state
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setHasMore(response.data.hasMore);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getCustomizableProductsData = async (page) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/product/list?custom=${true}`
      );
      if (response.data.success) {
        setCustomizableProducts((prevProducts) => [
          ...prevProducts,
          ...response.data.products,
        ]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const isDiscount = async (couponCode) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/user/verifyCode",
        { couponCode },
        { headers: { token } }
      );
      if (response.data.success) {
        setDiscount(response.data.discount);
        return response.data.discount;
      }
      return response.data.message;
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
    getCustomizableProductsData();
    userInfo();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
    if (token) {
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
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    getProductsData,
    getCustomizableProductsData,
    customizableProducts,
    setCustomizableProducts,
    navigate,
    backendUrl,
    setToken,
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
