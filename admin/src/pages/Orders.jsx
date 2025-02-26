import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [image, setImage] = useState("");
  const [imagePreivewOpen, setImagePreivewOpen] = useState(false);
  // const [paymentStatus, setPaymentStatus] = useState("");
  // const [orderStatus, setOrderStatus] = useState("");
  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
        // console.log(orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (value, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: value },
        { headers: { token } }
      );
      if (response.data.success) {
        // setOrderStatus(value);
        toast.success(response.data.message);
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  const PstatusHandler = async (value, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/paymentstatus",
        { orderId, payment: value },
        { headers: { token } }
      );
      if (response.data.success) {
        // setPaymentStatus(value);

        toast.success(response.data.message);

        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className=" max-sm:px-6">
      <h3>Order Page</h3>

      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700  bg-white"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    // console.log(order);
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span> {item.size} </span>{" "}
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {" "}
                        {item.name} x {item.quantity} <span> {item.size} </span>{" "}
                        ,
                      </p>
                    );
                  }
                })}
              </div>
              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">
                Items : {order.items.length}
              </p>
              <p className="text-sm sm:text-[15px] my-2">
                Amount:{" "}
                <span className=" font-bold">
                  {currency}
                  {order.amount}
                </span>
              </p>
              <p>Method : {order.paymentMethod}</p>
              <p>
                Payment :{" "}
                {order.payment == 1
                  ? "Done"
                  : order.payment == -1
                  ? "Pending"
                  : "Failed"}
              </p>
              <p>Date : {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="w-full flex-1 flex-col items-center gap-3 max-lg:col-start-2 max-lg:col-span-2">
              <p className="my-2 flex items-center gap-2">
                Payment status
                <span
                  className="p-2 rounded-full active:bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    setImage(order.paymentScreenshot);
                    setImagePreivewOpen(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-eye"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </p>
              <Select
                onValueChange={(value) => PstatusHandler(value, order._id)}
                value={order.payment}
                className="w-full p-2 font-semibold"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={-1}>Processing</SelectItem>
                  <SelectItem value={1}>Success</SelectItem>
                  <SelectItem value={0}>Failed</SelectItem>
                </SelectContent>
              </Select>
              <p className=" my-2">Order status</p>
              <Select
                onValueChange={(value) => statusHandler(value, order._id)}
                value={order.status}
                className="w-full p-2 font-semibold"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order Placed">Order Placed</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Out for delivery">
                    Out for delivery
                  </SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={imagePreivewOpen} onOpenChange={setImagePreivewOpen}>
        <DialogContent className="max-sm:w-[80%] max-h-[80%] rounded-md">
          <DialogHeader>
            <DialogTitle className="mb-3">Payment screenshot</DialogTitle>
          </DialogHeader>

          {image ? (
            <div className="w-full h-[50vh] flex items-center justify-center overflow-scroll no-scrollbar">
              <img
                src={image}
                alt="Preview"
                width={192}
                className="w-48 object-cover rounded-md shadow-lg "
              />
            </div>
          ) : (
            <p>No image added</p>
          )}
          <DialogFooter>
            <Button onClick={() => setImagePreivewOpen(false)} className="mb-2">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
