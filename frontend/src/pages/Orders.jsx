import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { assets } from "../assets/assets";
import SmallNavBar from "../components/SmallNavBar";

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);

  const [orderItemsData, setOrderItemsData] = useState([]);

  const loadOrderItemsData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        let allOrdersItem = [];
        // console.log(response.data);
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["orderId"] = order._id;
            allOrdersItem.push(item);
          });
        });
        setOrderItemsData(allOrdersItem);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // console.log(order);

  useEffect(() => {
    loadOrderItemsData();
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Orders"]} />

      <div className="border-t pt-7">
        <div className="text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        <div className="flex flex-col-reverse">
          {orderItemsData.map((item, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
            >
              <div className="flex items-start gap-6 text-sm">
                <img
                  className="w-16 sm:w-20"
                  src={item.image[0]}
                  alt="upload1"
                />
                <div>
                  <p className="sm:text-base font-medium">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                    <p>
                      {currency}
                      {item.price}
                    </p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className="mt-1">
                    Date:{" "}
                    <span className=" text-gray-400">
                      {new Date(item.date).toDateString()}
                    </span>
                  </p>
                  <p className="mt-1">
                    Payment:{" "}
                    <span className=" text-gray-400">{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              <div
                className="flex items-center text-xs gap-2 border px-4 py-2 font-medium rounded-sm hover:bg-gray-100 active:bg-gray-200 cursor-default"
                onClick={() => navigate(`/payment/${item.orderId}`)}
              >
                {/* {console.log(item.payment)} */}
                {item.payment == 1 ? (
                  <>
                    <img src={assets.ok_icon} alt="ok" width={20} height={20} />
                    Payment success
                  </>
                ) : item.payment == -1 ? (
                  <>
                    <img
                      src={assets.process_icon}
                      alt="ok"
                      width={20}
                      height={20}
                    />
                    Payment Processing
                  </>
                ) : (
                  <>
                    <img src={assets.no_icon} alt="ok" width={20} height={20} />
                    Payment failed
                  </>
                )}
                <div className="flex-1 flex justify-end">
                  <img
                    src={assets.right_icon}
                    alt="go"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className="md:w-1/2 flex justify-between lg:justify-evenly">
                <div className="w-[50%] md:w-[30%] group flex items-center flex-col gap-2 overflow-visible sticky z-0 border pl-3 pr-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 cursor-default">
                  Status
                  <div className="group-hover:flex hidden absolute -top-24 -right-20 bg-white w-fit items-center flex-col gap-2 z-10 border pl-3 pr-4 py-2 text-sm font-medium rounded-sm">
                    <span className="z-20 absolute top-[15%] left-[16.5px] w-1 h-[70%] align-middle border-gray-300 border-dashed border-2 border-y-0 border-r-0"></span>
                    {/* <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p> */}
                    <p className="flex z-30 items-center gap-2 w-full">
                      <img
                        src={
                          item.payment === 1 ||
                          item.status === "Shipped" ||
                          item.status === "Out for delivery" ||
                          item.status === "Delivered"
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
                          item.status === "Shipped" ||
                          item.status === "Out for delivery" ||
                          item.status === "Delivered"
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
                          item.status === "Out for delivery" ||
                          item.status === "Delivered"
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
                          item.status === "Delivered"
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

                <button
                  onClick={loadOrderItemsData}
                  className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 active:bg-gray-200 cursor-default"
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
