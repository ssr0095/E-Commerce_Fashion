import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import {Trash2} from "lucide-react"
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";
import SmallNavBar from "../components/SmallNavBar";

const Cart = () => {
  const {
    products,
    customizableProducts,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    verifyDiscountCode,
    discount,
    setDiscount,
    getCartAmount,
    token,
    applyingDiscount,
  } = useContext(ShopContext);

  const allProducts = [...products, ...customizableProducts];
  const [cartData, setCartData] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const discountValue = await verifyDiscountCode(couponCode);
    if (discountValue > 0) {
      setCouponCode(""); // Clear input on success
    }
  };

  const removeDiscount = () => {
    setDiscount(0);
    toast.info("Discount removed");
  };

  useEffect(() => {
    const allProducts = [...products, ...customizableProducts];
    if (allProducts.length > 0) {
      const tempData = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products, customizableProducts]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Cart"]} />
      <div className="border-t pt-7">
        <div className=" text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        <div>
          {cartData?.map((item, index) => {
            const productData = allProducts?.find(
              (product) => product._id === item._id
            );

            return (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className=" flex items-start gap-6">
                  <img
                    className="w-14 sm:w-16 aspect-[3/4]"
                    src={productData?.image[0]}
                    alt="image"
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {productData?.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
                        {currency}
                        {productData?.price}
                      </p>
                      <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                        {item?.size}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) =>
                    e.target.value === "" || e.target.value === "0"
                      ? null
                      : updateQuantity(
                          item?._id,
                          item?.size,
                          Number(e.target.value)
                        )
                  }
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                  type="number"
                  min={1}
                  defaultValue={item?.quantity}
                />
                <Trash2 
                onClick={() => updateQuantity(item?._id, item?.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
        </div>

        <div className="flex justify-between gap-10 my-20 flex-col lg:flex-row">
          <form onSubmit={applyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2 border rounded-md"
              disabled={applyingDiscount || discount > 0}
            />
            {discount > 0 ? (
              <button
                type="button"
                onClick={removeDiscount}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            ) : (
              <button
                type="submit"
                disabled={applyingDiscount || !couponCode.trim()}
                className={`px-4 py-2 rounded-md ${
                  applyingDiscount || !couponCode.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {applyingDiscount ? "Applying..." : "Apply"}
              </button>
            )}
          </form>
          {discount > 0 && (
          <p className="mt-2 text-green-600">
            {discount}% discount applied!
          </p>
        )}
      </div>
      <div className="w-full">
      <CartTotal />
      <div className=" w-full text-end">
        <button
          onClick={() => {
            if (getCartAmount() < 1) {
              toast.error("No items added");
            } else if (!token) {
              navigate("/login");
            } else {
              navigate("/place-order");
            }
          }}
          className="bg-gray-950 text-white shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 my-8 px-8 w-full sm:w-fit py-3"
        >
          PROCEED TO CHECKOUT
        </button>
      </div>
        </div>
    </div>
  )
}

export default Cart