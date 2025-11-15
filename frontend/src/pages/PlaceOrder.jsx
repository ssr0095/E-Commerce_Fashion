import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "sonner";
import SmallNavBar from "../components/SmallNavBar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import errorHandler from "../lib/errorHandler";

const PlaceOrder = () => {
  const [method, setMethod] = useState("razorpay");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorLoaded, setIsRazorLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    clearCart,
    getCartAmount,
    delivery_fee,
    products,
    customizableProducts,
    bestSellerProducts,
    discount,
    refreshOrders,
  } = useContext(ShopContext);

  const allProducts = [
    ...products,
    ...customizableProducts,
    bestSellerProducts,
  ];

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  // Improved form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) errors.email = "Invalid email";
    if (!formData.phone.match(/^\d{10}$/))
      errors.phone = "Valid phone number (10 digits) required";
    if (formData.street.trim().length < 5)
      errors.street = "Street address is too short";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.zipcode.trim()) errors.zipcode = "Zipcode is required";
    if (!formData.country.trim()) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const prepareOrderItems = () => {
    return Object.entries(cartItems).flatMap(([productId, sizes]) =>
      Object.entries(sizes)
        .filter(([_, quantity]) => quantity > 0)
        .map(([size, quantity]) => {
          const product = allProducts.find((p) => p._id === productId);
          if (!product) {
            console.warn(`Product ${productId} not found`);
            return null;
          }

          return {
            ...product,
            size,
            quantity,
            paymentMethod: method,
          };
        })
        .filter(Boolean)
    );
  };

  // Improved Razorpay initialization
  const initRazorPay = async (orderData) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }

    try {
      // Create Razorpay order first
      const response = await axios.post(
        backendUrl + "/api/order/razorpay",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success || !response.data?.order) {
        throw new Error(
          response.data?.message || "Failed to create Razorpay order"
        );
      }

      const razorpayOrder = response.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Cousins Fashion",
        description: `Order #${razorpayOrder.receipt}`,
        order_id: razorpayOrder.id,
        // image: "/logo.png", // Add your logo
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          order_id: razorpayOrder.receipt,
          address: `${formData.street}, ${formData.city}`,
        },
        theme: {
          color: "#ccc233ff",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              backendUrl + "/api/order/verifyRazorpay",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: razorpayOrder.receipt,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful!");
              await refreshOrders();
              clearCart();
              navigate("/orders", {
                state: { message: "Order placed successfully!" },
              });
            } else {
              throw new Error(
                verifyResponse.data.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
            errorHandler.handle(error, {
              component: "PlaceOrder",
              action: "razorpayHandler",
              orderId: razorpayOrder.receipt,
            });
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. You can try again.");
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // Handle Razorpay errors
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      errorHandler.handle(error, {
        component: "PlaceOrder",
        action: "initRazorPay",
      });
    }
  };

  const handlePayment = async (orderData) => {
    const paymentEndpoints = {
      googlepay: "/api/order/googlepay",
      cod: "/api/order/place",
      stripe: "/api/order/stripe",
      razorpay: "/api/order/razorpay",
    };

    try {
      const response = await axios.post(
        backendUrl + paymentEndpoints[method],
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Payment processing failed");
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Payment error:", errorMessage);
      throw new Error(errorMessage);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    if (getCartAmount() < 1) {
      toast.error("Your cart is empty");
      return;
    }

    if (method === "razorpay" && !isRazorLoaded) {
      toast.error("Payment system is loading. Please wait a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = prepareOrderItems();
      const hasCustomItem = orderItems.some((item) => item.customizable);

      const orderData = {
        address: formData,
        items: orderItems,
        amount: Math.max(
          1, // Minimum amount for Razorpay
          Math.round(
            getCartAmount() +
              delivery_fee -
              Math.ceil((getCartAmount() * discount) / 100)
          )
        ),
        isCustomizable: hasCustomItem,
      };

      // For Razorpay, handle separately
      if (method === "razorpay") {
        await initRazorPay(orderData);
        setIsSubmitting(false);
        return;
      }

      // For other payment methods
      const result = await handlePayment(orderData);

      switch (method) {
        case "googlepay":
          await refreshOrders();
          clearCart();
          navigate(`/payment/${result.orderId}`);
          break;

        case "cod":
          clearCart();
          navigate("/orders", {
            state: { message: "Order placed successfully!" },
          });
          break;

        case "stripe":
          window.location.href = result.session_url;
          break;

        default:
          clearCart();
          navigate("/orders");
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error(error.message || "Failed to process order");
      errorHandler.handle(error, {
        component: "PlaceOrder",
        action: "onSubmitHandler",
      });
    } finally {
      if (method !== "razorpay") {
        setIsSubmitting(false);
      }
    }
  };

  // Improved Razorpay script loading
  useEffect(() => {
    if (window.Razorpay) {
      setIsRazorLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Razorpay SDK loaded successfully");
      setIsRazorLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      toast.error("Failed to load payment system. Please refresh the page.");
      setIsRazorLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      toast.error("Please login to place order");
      navigate("/login");
      return;
    }
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Cart", "Check out"]} />
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col lg:flex-row justify-between gap-4 pt-3 sm:pt-7 min-h-[80vh] border-t"
      >
        {/* ------------- Left Side INPUTS---------------- */}
        <div className="flex flex-col gap-4 w-full md:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1={"DELIVERY"} text2={"INFORMATION"} />
          </div>
          <div className="flex gap-3">
            <Input
              required
              onChange={onChangeHandler}
              name="firstName"
              value={formData?.firstName}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.firstName ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="First name"
            />
            {formErrors?.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors?.firstName}
              </p>
            )}
            <Input
              onChange={onChangeHandler}
              name="lastName"
              value={formData?.lastName}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.lastName ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Last name"
            />
            {formErrors?.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors?.lastName}
              </p>
            )}
          </div>
          <Input
            required
            onChange={onChangeHandler}
            name="email"
            value={formData?.email}
            className={`border rounded py-1.5 px-3.5 w-full ${
              formErrors?.email ? "border-red-500" : "border-gray-300"
            }`}
            type="email"
            placeholder="Email address"
          />
          {formErrors?.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors?.email}</p>
          )}
          <Input
            required
            onChange={onChangeHandler}
            name="street"
            value={formData?.street}
            className={`border rounded py-1.5 px-3.5 w-full ${
              formErrors?.street ? "border-red-500" : "border-gray-300"
            }`}
            type="text"
            placeholder="Street"
          />
          {formErrors?.street && (
            <p className="text-red-500 text-sm mt-1">{formErrors?.street}</p>
          )}
          <div className="flex gap-3">
            <Input
              required
              onChange={onChangeHandler}
              name="city"
              value={formData?.city}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.city ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="City"
            />
            {formErrors?.city && (
              <p className="text-red-500 text-sm mt-1">{formErrors?.city}</p>
            )}
            <Input
              onChange={onChangeHandler}
              name="state"
              value={formData?.state}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.state ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="State"
            />
            {formErrors?.state && (
              <p className="text-red-500 text-sm mt-1">{formErrors?.state}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              required
              onChange={onChangeHandler}
              name="zipcode"
              value={formData?.zipcode}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.zipcode ? "border-red-500" : "border-gray-300"
              }`}
              type="number"
              placeholder="Zipcode"
            />
            {formErrors?.zipcode && (
              <p className="text-red-500 text-sm mt-1">{formErrors?.zipcode}</p>
            )}
            <Input
              required
              onChange={onChangeHandler}
              name="country"
              value={formData?.country}
              className={`border rounded py-1.5 px-3.5 w-full ${
                formErrors?.country ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Country"
            />
            {formErrors?.country && (
              <p className="text-red-500 text-sm mt-1">{formErrors?.country}</p>
            )}
          </div>
          <Input
            required
            onChange={onChangeHandler}
            name="phone"
            value={formData?.phone}
            className={`border rounded py-1.5 px-3.5 w-full ${
              formErrors?.phone ? "border-red-500" : "border-gray-300"
            }`}
            type="number"
            placeholder="Phone"
          />
          {formErrors?.phone && (
            <p className="text-red-500 text-sm mt-1">{formErrors?.phone}</p>
          )}
        </div>

        <div className="mt-8">
          <div className="mt-8 min-w-70">
            <CartTotal />
          </div>

          <div className="mt-12">
            <Title text1={"PAYMENT"} text2={"METHOD"} />
            <div className="flex gap-3 flex-col lg:flex-row">
              <div
                onClick={() => setMethod("razorpay")}
                className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                  method === "razorpay"
                    ? "border-green-500 border-2 bg-gray-200"
                    : "border-2 border-gray-300"
                } ${!isRazorLoaded ? "opacity-50 cursor-not-allowed" : ""}`}
                title={!isRazorLoaded ? "Payment system loading..." : ""}
                disabled={!isRazorLoaded}
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "razorpay" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></p>
                <img
                  className="h-5 mx-4"
                  src={assets.razorpay_logo}
                  alt="Razorpay"
                />
                {!isRazorLoaded && "Loading..."}
              </div>
              <div
                onClick={() => setMethod("googlepay")}
                className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                  method === "googlepay"
                    ? "border-green-500 border-2 bg-gray-200"
                    : "border-2 border-gray-300"
                }`}
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "googlepay" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></p>
                <img
                  className="h-5 ml-4"
                  src={assets.googlepay_logo}
                  alt="Google Pay icon by Icons8"
                />
                Google Pay
              </div>
              <div
                disabled={true}
                // onClick={() => setMethod("cod")}
                className={`flex items-center gap-3 border p-2 px-3 opacity-80 cursor-not-allowed ${
                  method === "cod"
                    ? "border-green-500 border-2 bg-gray-200"
                    : "border-2 border-gray-300"
                }`}
                title={"Not available"}
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "cod" ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">
                  CASH ON DELIVERY
                </p>
              </div>
            </div>

            <div className="w-full text-end mt-8">
              <Button
                type="submit"
                disabled={
                  isSubmitting || (method === "razorpay" && !isRazorLoaded)
                }
                className={`rounded-none my-8 px-8 w-full sm:w-fit py-3 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "PROCESSING..." : "PLACE ORDER"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
