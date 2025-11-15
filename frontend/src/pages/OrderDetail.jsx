import { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "sonner";
import QRCode from "../components/QrCode";
import { assets } from "../assets/assets";
import SmallNavBar from "../components/SmallNavBar";
import Loader from "../components/CompLoader";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import imageCompression from "browser-image-compression";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  QrCode,
  CheckCircle2,
  MapPin,
  Package,
  CreditCard,
} from "lucide-react";
import { ShopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";

const OrderDetail = () => {
  const [showQR, setShowQR] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    token,
    backendUrl,
    currency,
    navigate,
    refreshOrders,
    delivery_fee,
    getCartAmount,
    discount,
    StatusBadge,
  } = useContext(ShopContext);

  const { orderId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [isCustom, setIsCustom] = useState(false);
  const [isGoodlePay, setIsGoodlePay] = useState(false);
  const [cartAmount, setCartAmount] = useState(0);

  // Payment image state
  const [paymentImage, setPaymentImage] = useState(null);
  const [isPaymentImageUploaded, setIsPaymentImageUploaded] = useState(false);

  // Design image state
  const [designImage, setDesignImage] = useState(null);
  const [designDetail, setDesignDetail] = useState("");
  const [isDesignImageUploaded, setIsDesignImageUploaded] = useState(false);

  // Constants
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 3 * 1024 * 1024; // 3MB

  const options = {
    month: "short", // Full month name (e.g., "November")
    day: "numeric", // Day of the month (e.g., "15")
    year: "numeric", // Full year (e.g., "2025")
    hour: "numeric", // Hour (e.g., "7")
    minute: "numeric", // Minute (e.g., "20")
    // second: 'numeric', // Second (e.g., "30")
    hour12: true, // Use 12-hour format with AM/PM
  };

  const loadOrderData = async () => {
    if (!token) {
      toast.error("Please login to view order");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/getuserorder`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const orderData = response.data.order;
        setOrder(orderData);
        setCartAmount(orderData.amount - delivery_fee);
        // Calculate total quantity
        const totalQuantity = orderData.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setQuantity(totalQuantity);

        // Check for customizable items
        // console.log(orderData);
        setIsCustom(orderData.isCustomizable);
        setIsGoodlePay(orderData.paymentMethod === "Google Pay");
        setIsPaymentImageUploaded(
          (prev) => orderData.paymentScreenshot && !prev
        );
        setIsDesignImageUploaded(
          (prev) => orderData.customDesignImage && !prev
        );
      }
    } catch (error) {
      toast.error(
        error.message || error.response?.data?.message || "Failed to load order"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, AVIF, or WEBP images are allowed.");
      return false;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 3MB.");
      return false;
    }
    return true;
  };

  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    } catch (error) {
      // toast.error("Image compression error");
      return file; // Fallback to original if compression fails
    }
  };

  const handleFileChange = async (e, setImage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      e.target.value = ""; // Clear input
      return;
    }

    setImage(file);
  };

  const uploadDesignImage = async () => {
    if (!designImage) {
      toast.error("Please select a design image");
      return false;
    }
    if (!designDetail.trim()) {
      toast.error("Please provide design details");
      return false;
    }

    try {
      setIsLoading(true);
      const compressedImage = await compressImage(designImage);

      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("designImage", compressedImage);
      formData.append("designDetail", designDetail);

      const response = await axios.post(
        `${backendUrl}/api/order/addDesignImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Crucial for file uploads
            Authorization: `Bearer ${token}`,
          },
          // withCredentials: true, // For cookies if using
        }
      );

      if (response.data.success) {
        setIsDesignImageUploaded(true);
        toast.success("Design uploaded successfully");
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload design");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPaymentImage = async () => {
    if (!paymentImage) {
      toast.error("Please select a payment screenshot");
      return;
    }

    if (isCustom && !isDesignImageUploaded) {
      toast.error("Please upload design first");
      return;
    }

    try {
      setIsLoading(true);
      const compressedImage = await compressImage(paymentImage);

      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("paymentImage", compressedImage);

      const response = await axios.post(
        `${backendUrl}/api/order/addPaymentScreenshot`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Crucial for file uploads
            Authorization: `Bearer ${token}`,
          },
          // withCredentials: true, // For cookies if using
        }
      );

      if (response.data.success) {
        setIsPaymentImageUploaded(true);
        toast.success("Payment uploaded successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token, orderId]);

  if (!order) {
    return <Loader />;
  }

  const orderStatusSteps = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
  ];
  const currentStepIndex = orderStatusSteps.indexOf(order.status);

  const handleUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => {
      setShowUpload(false);
    }, 1000);
  };

  return (
    // <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] mb-20">
      {isLoading && <Loader />}

      <SmallNavBar navs={["Orders", "details"]} />

      <div className="border-t pt-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-start flex-col gap-1">
            <p className="text-md sm:text-2xl font-semibold">
              Order ID: {order._id.slice(-9)}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {Intl.DateTimeFormat("en-US", options).format(
                new Date(order.date)
              )}
            </p>
          </div>

          <StatusBadge status={order.status}></StatusBadge>
        </div>

        <div className="w-full flex items-start flex-col lg:flex-row gap-3 pt-5">
          {/* Items */}
          <Card className="min-w-xs rounded-2xl shadow-sm border flex-1">
            <CardHeader>
              <h3 className="font-medium">Ordered Items</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image[0]}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="w-full">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{item.price}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="w-full lg:w-[20vw] flex items-start flex-col gap-3">
            {/* Shipping Address */}
            <Card className="rounded-2xl shadow-sm border w-full">
              <CardHeader className="flex items-center flex-row gap-1">
                <MapPin className="size-4 text-primary" />
                <h3 className="font-medium">Shipping Address</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-start flex-col gap-1">
                  <p className="font-medium">{`${order.address.firstName} ${order.address.lastName}`}</p>
                  <p>
                    {order.address.street}, {order.address.city}
                  </p>
                  <p>
                    {order.address.state} - {order.address.zipcode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card className="rounded-2xl shadow-sm border w-full">
              <CardHeader className="flex items-center flex-row gap-1">
                <MapPin className="size-4 text-primary" />
                <h3 className="font-medium">Billing Address</h3>
              </CardHeader>
              <CardContent>
                <p>Same as shipping address</p>
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card className="rounded-2xl shadow-sm border w-full">
              <CardHeader className="flex items-center flex-row gap-1">
                <MapPin className="size-4 text-primary" />
                <h3 className="font-medium">Order Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 mt-2 text-sm">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>
                      {currency} {cartAmount}.00
                    </p>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <p>Shipping Fee</p>
                    <p>
                      {currency} {delivery_fee}.00
                    </p>
                  </div>
                  <hr />
                  {discount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <p>
                          Discount{" "}
                          <span className="ml-1 text-gray-600">
                            {discount}%
                          </span>
                        </p>
                        <p>
                          - {currency}{" "}
                          {Math.ceil((cartAmount * discount) / 100)}.00
                        </p>
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="flex justify-between">
                    <b>Total</b>
                    <b>
                      {currency}{" "}
                      {cartAmount === 0
                        ? 0
                        : cartAmount +
                          delivery_fee -
                          Math.ceil((cartAmount * discount) / 100)}
                      .00
                    </b>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order Timeline */}
        {/* <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <h3 className="font-medium">Order Status</h3>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2 text-sm text-muted-foreground">
              {orderStatusSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`text-center ${
                    idx <= currentStepIndex ? "text-primary font-medium" : ""
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <Progress
              value={((currentStepIndex + 1) / orderStatusSteps.length) * 100}
              className="h-2"
            />
          </CardContent>
        </Card> */}

        {/* Payment Section */}
        {/* <Card className="rounded-2xl shadow-sm border">
          <CardHeader className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Payment</h3>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Pay via QR
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Payment Screenshot
            </Button>
          </CardContent>
        </Card> */}

        {/* QR Dialog */}
        {/* <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="max-sm:w-[95%] sm:max-w-md rounded-lg">
            <DialogHeader>
              <div className="text-xl sm:text-2xl mb-3">
                <Title text1="COMPLETE" text2="PAYMENT" />
              </div>
            </DialogHeader>
            <div className="w-full flex items-center flex-col space-y-6">
              <div className="flex items-center gap-2">
                <img src={assets.ok_icon} alt="OK" width={24} height={24} />
                <h2 className="text-3xl font-bold">
                  {currency} {order?.amount?.toFixed(2)}
                </h2>
              </div>

              <QRCode
                upiId={import.meta.env.VITE_UPI}
                amount={order?.amount?.toString()}
                name={import.meta.env.VITE_BANKNAME}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setShowQR(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}

        {/* Upload Dialog */}
        {/* <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className="text-xl sm:text-2xl text-center mb-3">
                <Title text1="UPLOAD" text2="PAYMENT SCREENSHOT" />
              </div>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="paymentImage" className="cursor-pointer">
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-500 bg-gray-200 hover:bg-gray-300 flex flex-col items-center justify-center overflow-hidden">
                  {paymentImage ? (
                    <img
                      src={URL.createObjectURL(paymentImage)}
                      alt="Payment preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <img
                        src={assets.upload_area}
                        alt="Upload payment image"
                        className="w-6 h-6"
                      />
                      <p className="text-gray-500 mt-2">
                        Upload{" "}
                        <span className="text-blue-500 underline">image</span>
                      </p>
                    </>
                  )}
                </div>
              </Label>

              <Input
                type="file"
                id="paymentImage"
                accept={allowedTypes.join(",")}
                onChange={(e) => handleFileChange(e, setPaymentImage)}
                className="hidden"
                disabled={isPaymentImageUploaded}
              />

              <Button
                className="bg-gray-950 hover:bg-gray-800 rounded-none mt-4 w-48"
                onClick={uploadPaymentImage}
                disabled={
                  !paymentImage ||
                  (isCustom && !isDesignImageUploaded) ||
                  isPaymentImageUploaded
                }
              >
                {isPaymentImageUploaded ? "Uploaded" : "Upload Payment"}
              </Button>
            </div>
            {uploadSuccess ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="mt-3 font-medium">Upload Successful!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4">
                <input type="file" className="text-sm" />
                <Button onClick={handleUpload}>Upload</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>  */}
      </div>
    </div>
  );
};

export default OrderDetail;
