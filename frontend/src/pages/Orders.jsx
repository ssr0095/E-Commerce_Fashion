import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { assets } from "../assets/assets";
import SmallNavBar from "../components/SmallNavBar";
import Loader from "../components/CompLoader";
import { toast } from "react-toastify";
import { PackageCheck, ArrowRight } from "lucide-react";

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async (forceRefresh = false) => {
    if (!token) return;

    setIsLoading(true);

    const cacheKey = "UserCachedOrders";
    const cacheTimeKey = "UserCachedOrdersTime";
    const cacheExpiry = 1 * 60 * 1000; // 1 minutes

    const now = Date.now();
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);

    if (
      !forceRefresh &&
      cachedData &&
      cachedTime &&
      now - Number(cachedTime) < cacheExpiry
    ) {
      setOrders(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      setIsLoading(false);

      if (response.data.success) {
        // const allOrdersItem = [];

        // response.data.orders.forEach((order) => {
        //   order.items.forEach((item) => {
        //     allOrdersItem.push({
        //       ...item,
        //       status: order.status,
        //       payment: order.payment,
        //       paymentMethod: order.paymentMethod,
        //       date: order.date,
        //       orderId: order._id,
        //     });
        //   });
        // });
        setOrders(response.data.orders);
        // setOrders(allOrdersItem);
        localStorage.setItem(cacheKey, JSON.stringify(response.data.orders));
        localStorage.setItem(cacheTimeKey, now.toString());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {isLoading && <Loader />}
      <SmallNavBar navs={["Orders"]} />

      <div className="border-t pt-7">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        <div className="flex flex-col-reverse">
          {orders.map((order, index) => (
            <div
              key={order._id || index}
              className="grid max-md:grid-cols-[1fr_1fr] md:grid-cols-[0.3fr_0.8fr_0.8fr_1fr_0.8fr] gap-4 items-start border-b-2 border-gray-200 py-5 md:py-8 text-sm text-gray-700 bg-white"
            >
              {/* ------------ */}
              <PackageCheck className="max-md:hidden size-12 self-start" />
              {/* ------------ */}
              <div>
                {order.items.map((item, i) => (
                  <p className="text-xs md:text-sm text-gray-700" key={i}>
                    <span className="truncate">{item.name}</span> x{" "}
                    {item.quantity}{" "}
                    <span className="px-1 py-0.5 mx-1 rounded bg-gray-100">
                      {item.size}
                    </span>
                    <span className="font-medium">
                      {currency}
                      {item.price}
                    </span>
                    {i < order.items.length - 1 ? "," : ""}
                  </p>
                ))}
              </div>
              {/* ------------ */}
              <div>
                <div className="flex items-start flex-col text-xs md:text-md text-gray-700">
                  <p className="">
                    Items :{" "}
                    <span className="text-gray-500">{order.items.length}</span>
                  </p>
                  <p className="text-xs sm:text-[15px] my-2">
                    Amount:{" "}
                    <span className="font-bold">
                      {currency}
                      {order.amount}
                    </span>
                  </p>
                  <p className="">
                    Date:{" "}
                    <span className="text-gray-500">
                      {new Date(order.date).toDateString()}
                    </span>
                  </p>
                  <p className="">
                    Payment:{" "}
                    <span className="text-gray-500">{order.paymentMethod}</span>
                  </p>
                </div>
              </div>
              {/* ------------------- */}
              <div
                className="flex items-center justify-center text-xs gap-2 border px-4 py-2 max-md:col-span-2 font-medium rounded-sm hover:bg-gray-100 active:bg-gray-200 cursor-default"
                onClick={() => navigate(`/payment/${order._id}`)}
              >
                {order.payment === 1 ? (
                  <>
                    <img src={assets.ok_icon} alt="ok" width={20} height={20} />
                    Payment success
                  </>
                ) : order.payment === -1 ? (
                  <>
                    <img
                      src={assets.process_icon}
                      alt="processing"
                      width={20}
                      height={20}
                    />
                    Payment Processing
                  </>
                ) : (
                  <>
                    <img
                      src={assets.no_icon}
                      alt="failed"
                      width={20}
                      height={20}
                    />
                    Payment failed
                  </>
                )}
                <div className="flex-1 flex justify-end">
                  <ArrowRight className="w-5 text-gray-400" />
                </div>
              </div>
              {/* ------------ */}
              <div className="flex flex-col items-center justify-evenly max-md:gap-3 gap-5 max-md:col-span-2">
                <div className="w-full md:w-[70%] group flex items-center flex-col gap-2 overflow-visible sticky z-0 border pl-3 pr-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 cursor-default">
                  Status
                  <div className="group-hover:flex hidden absolute -top-24 -right-3 md:-top-24  md:-left-20 bg-white w-fit items-center flex-col gap-2 z-10 border pl-3 pr-4 py-2 text-sm font-medium rounded-sm">
                    <span className="z-20 absolute top-[15%] left-[16.5px] w-1 h-[70%] align-middle border-gray-300 border-dashed border-2 border-y-0 border-r-0"></span>
                    <p className="flex z-30 items-center gap-2 w-full">
                      <img
                        src={
                          order.payment === 1 ||
                          order.status === "Shipped" ||
                          order.status === "Out for delivery" ||
                          order.status === "Delivered"
                            ? assets.ok_icon
                            : assets.round_icon
                        }
                        alt="ok"
                        width={12}
                        height={12}
                      />
                      Order placed
                    </p>
                    <p className="flex items-center gap-2 w-full z-30">
                      <img
                        src={
                          order.status === "Shipped" ||
                          order.status === "Out for delivery" ||
                          order.status === "Delivered"
                            ? assets.ok_icon
                            : assets.round_icon
                        }
                        alt="ok"
                        width={12}
                        height={12}
                      />
                      Shipped
                    </p>
                    <p className="flex items-center gap-2 w-full z-30">
                      <img
                        src={
                          order.status === "Out for delivery" ||
                          order.status === "Delivered"
                            ? assets.ok_icon
                            : assets.round_icon
                        }
                        alt="ok"
                        width={12}
                        height={12}
                      />
                      Out for delivery
                    </p>
                    <p className="flex items-center gap-2 w-full z-30">
                      <img
                        src={
                          order.status === "Delivered"
                            ? assets.ok_icon
                            : assets.round_icon
                        }
                        alt="ok"
                        width={12}
                        height={12}
                      />
                      Delivered
                    </p>
                  </div>
                </div>
                {/* ------------ */}
                <button
                  onClick={() => loadOrders()}
                  className="w-full md:w-[70%] border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 active:bg-gray-200 cursor-default"
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
