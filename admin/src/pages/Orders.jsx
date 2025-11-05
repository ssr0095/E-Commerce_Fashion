import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
// import { assets } from "../assets/assets";
import { PackageCheck, Eye, Settings2 } from "lucide-react";
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
import Loader from "../components/CompLoader";

const Orders = ({ token, setToken }) => {
  const [orders, setOrders] = useState([]);
  const [image, setImage] = useState("");
  const [imagePreivewOpen, setImagePreivewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customImage, setCustomImage] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [customOpen, setCustomOpen] = useState(false);

  const fetchAllOrders = async (forceRefresh = false) => {
    if (!token) return;
    setIsLoading(true);
    const cacheKey = "cachedOrders";
    const cacheTimeKey = "cachedOrdersTime";
    const cacheExpiry = 2 * 60 * 1000; // 2 minutes

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
        backendUrl + "/api/order/list",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      if (response.data.success) {
        const reversedOrders = response.data.orders.reverse();
        setOrders(reversedOrders);
        localStorage.setItem(cacheKey, JSON.stringify(reversedOrders));
        localStorage.setItem(cacheTimeKey, now.toString());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      if (error.status == 401) {
        setToken("");
        localStorage.removeItem("token");
        window.location.reload();
      }
    }
  };

  const statusHandler = async (value, orderId) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrders(true); // force refresh
      }
    } catch (error) {
      toast.error("Failed to update order status.");
      if (error.status == 401) {
        setToken("");
        localStorage.removeItem("token");
        window.location.reload();
      }
    }
  };

  const PstatusHandler = async (value, orderId) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/paymentstatus",
        { orderId, payment: value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrders(true); // force refresh
      }
    } catch (error) {
      toast.error("Failed to update payment status.");
      if (error.status == 401) {
        setToken("");
        localStorage.removeItem("token");
        window.location.reload();
      }
    }
  };

  const ImageDownload = async () => {
    try {
      const response = await fetch(customImage, { mode: "cors" });
      const blob = await response.blob();
      const mimeType = blob.type; // e.g., 'image/jpeg', 'image/png'

      let extension = "jpg";
      if (mimeType === "image/png") extension = "png";
      else if (mimeType === "image/webp") extension = "webp";
      // Add more types if needed

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `custom-design-${Date.now()}.${extension}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="max-sm:px-6">
      <div className="flex items-center justify-between">
        <h3>Order Page</h3>
        <Button
          className=""
          variant="outline"
          onClick={() => fetchAllOrders(true)}
        >
          Refresh
        </Button>
      </div>
      {isLoading && <Loader />}

      {orders?.length === 0 ? (
        <div className="w-full text-center py-10 text-gray-500">
          No orders found
        </div>
      ) : (
        <>
          {orders.map((order, index) => {
            const customizableItem = order.isCustomizable;
            return (
              <div
                key={index}
                className="grid max-sm:grid-cols-[1fr_1fr] sm:grid-cols-[0.5fr_2fr_1fr] gap-4 items-start border-2 border-gray-200 p-5 md:p-8 my-3 text-sm text-gray-700 bg-white"
              >
                <PackageCheck className="max-sm:hidden size-10" />
                <div>
                  {order.items.map((item, i) => (
                    <p className="py-0.5" key={i}>
                      {item.name} x {item.quantity} <span>{item.size}</span>
                      {i < order.items.length - 1 ? "," : ""}
                    </p>
                  ))}
                  <p className="mt-3 mb-2 font-bold">
                    {order.address.firstName + " " + order.address.lastName}
                  </p>
                  <p>{order.address.street},</p>
                  <p>{`${order.address.city}, ${order.address.state}, ${order.address.country}, ${order.address.zipcode}`}</p>
                  <p>{order.address.phone}</p>
                </div>
                <div>
                  <p className="text-sm sm:text-[15px]">
                    Items : {order.items.length}
                  </p>
                  <p className="text-sm sm:text-[15px] my-2">
                    Amount:{" "}
                    <span className="font-bold">
                      {currency}
                      {order.amount}
                    </span>
                  </p>
                  <p>Method: {order.paymentMethod}</p>
                  <p>
                    Payment:{" "}
                    {order.payment === 1
                      ? "Done"
                      : order.payment === -1
                      ? "Pending"
                      : "Failed"}
                  </p>
                  <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div className="w-full flex-1 flex-col items-center gap-3 sm:col-start-2 col-span-2">
                  <p className="my-2 flex items-center gap-2">
                    Payment status
                    <Button
                      className="px-3 py-0.5"
                      variant="default"
                      onClick={() => {
                        setImage(order.paymentScreenshot);
                        setImagePreivewOpen(true);
                      }}
                    >
                      Screen shot
                      <Eye />
                    </Button>
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
                      <SelectItem value="On Shipping">
                        On Shipping
                      </SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Customization Button */}
                  {customizableItem && (
                    <Button
                      variant="default"
                      className="mt-3"
                      onClick={() => {
                        setCustomImage(
                          order.customDesignImage.replace(
                            "/upload/",
                            "/upload/fl_attachment/"
                          )
                        );
                        setCustomDetail(order.customDesignDetail);
                        setCustomOpen(true);
                      }}
                    >
                      Customization
                      <Settings2 />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Payment Screenshot Dialog */}
          <Dialog open={imagePreivewOpen} onOpenChange={setImagePreivewOpen}>
            <DialogContent className="max-sm:w-[80%] max-h-[80%] rounded-md">
              <DialogHeader>
                <DialogTitle className="mb-3">Payment screenshot</DialogTitle>
              </DialogHeader>
              {image ? (
                <div className="w-full h-[50vh] flex justify-center items-center overflow-auto">
                  <img
                    src={image}
                    alt="screenshot image"
                    width={192}
                    className="w-48 object-cover rounded-md shadow-lg"
                  />
                </div>
              ) : (
                <p>No image added</p>
              )}
              <DialogFooter>
                <Button onClick={() => setImagePreivewOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Customization Dialog */}
          <Dialog open={customOpen} onOpenChange={setCustomOpen}>
            <DialogContent className="max-sm:w-[80%] max-h-[80%] overflow-y-auto rounded-md">
              <DialogHeader>
                <DialogTitle className="mb-3">Custom Design</DialogTitle>
              </DialogHeader>
              {customImage ? (
                <div className="w-full flex flex-col items-center gap-4 overflow-auto">
                  <img
                    src={customImage}
                    alt="custom design image"
                    width={192}
                    className="w-48 object-cover rounded-md shadow-lg"
                  />{" "}
                  {/* Download Button */}
                  {/* <a
                target="_blank"
                href={customImage}
                download={`custom-design-${Date.now()}.jpg`}
                className="mt-2"
              >
                ......
              </a> */}
                  <Button
                    variant="default"
                    className="w-48"
                    onClick={ImageDownload}
                  >
                    Download
                  </Button>
                  <div className="w-full self-start text-sm p-3 rounded-md border border-gray-400">
                    <p className="font-medium">Detail</p>
                    <p className="text-gray-700">{customDetail}</p>
                  </div>
                </div>
              ) : (
                <p>No customization found</p>
              )}
              {/* <DialogFooter>
            <Button onClick={() => setCustomOpen(false)}>Close</Button>
          </DialogFooter> */}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Orders;
