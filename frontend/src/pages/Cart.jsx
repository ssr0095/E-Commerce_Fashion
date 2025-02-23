import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";
import SmallNavBar from "../components/SmallNavBar";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    isDiscount,
    discount,
    setDiscount,
    getCartAmount,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  if (cartItems.length < 1) {
    navigate("/");
  }

  const onChangeHandler = (event) => {
    const value = event.target.value;
    setCouponCode(value);
  };

  const isCouponValid = async (e) => {
    e.preventDefault();

    try {
      const res = await isDiscount(couponCode);

      if (res > 0) {
        toast.success("Promo code applied");
        setDiscount(res);
      } else {
        toast.error("Invalid Promo code");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
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
  }, [cartItems, products]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Cart"]} />
      <div className="border-t pt-7">
        <div className=" text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>

        <div>
          {cartData?.map((item, index) => {
            const productData = products.find(
              (product) => product._id === item._id
            );

            return (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
              >
                <div className=" flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20"
                    src={productData.image[0]}
                    alt=""
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium">
                      {productData.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2">
                      <p>
                        {currency}
                        {productData.price}
                      </p>
                      <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                        {item.size}
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  onChange={(e) =>
                    e.target.value === "" || e.target.value === "0"
                      ? null
                      : updateQuantity(
                          item._id,
                          item.size,
                          Number(e.target.value)
                        )
                  }
                  className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                />
                <img
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  className="w-4 mr-4 sm:w-5 cursor-pointer"
                  src={assets.bin_icon}
                  alt=""
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between gap-10 my-20 flex-col lg:flex-row">
          <form
            className="w-full sm:w-[450px] space-y-4"
            onSubmit={isCouponValid}
          >
            <h3 className="text-xl font-semibold text-gray-900">
              Enter Promo Code
            </h3>
            <div className="flex w-full items-center gap-3">
              <input
                type="text"
                placeholder="Enter"
                className="input"
                onChange={onChangeHandler}
                value={couponCode}
              />
              <button
                type="submit"
                className={`w-2/6 bg-gray-950 p-2.5 text-white shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 ${
                  discount > 0 && " cursor-not-allowed"
                }`}
                disabled={discount > 0 ? true : false}
              >
                Apply
              </button>
            </div>
          </form>
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className=" w-full text-end">
              <button
                onClick={() => {
                  if (getCartAmount() < 1) {
                    toast.error("No items added");
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
      </div>
    </div>
  );
};

export default Cart;
