import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";
import QRCode from "../components/QrCode";
import { assets } from "../assets/assets";
import { useParams } from "react-router-dom";
import SmallNavBar from "../components/SmallNavBar";
import Loader from "../components/CompLoader";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import imageCompression from "browser-image-compression";

const Payment = () => {
  const { token, backendUrl, currency, navigate, refreshOrders } =
    useContext(ShopContext);
  const { orderId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [isCustom, setIsCustom] = useState(false);

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

        // Calculate total quantity
        const totalQuantity = orderData.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setQuantity(totalQuantity);

        // Check for customizable items
        // console.log(orderData);
        setIsCustom(orderData.isCustomizable);
        setIsPaymentImageUploaded(
          (prev) => orderData.paymentScreenshot && !prev
        );
        setIsDesignImageUploaded(
          (prev) => orderData.customDesignImage && !prev
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load order");
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

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {isLoading && <Loader />}

      <SmallNavBar navs={["Orders", "Payment"]} />

      <div className="border-t pt-7">
        {/* Design Section for Custom Items */}
        {isCustom && (
          <div className="mb-16">
            <div className="text-xl sm:text-2xl my-3">
              <Title text1="DESIGN" text2="INFORMATION" />
            </div>

            <div className="w-full max-w-lg flex flex-col gap-3">
              <div className="space-y-2">
                <Label htmlFor="designImage">Upload design</Label>
                <Input
                  type="file"
                  accept={allowedTypes.join(",")}
                  onChange={(e) => handleFileChange(e, setDesignImage)}
                  id="designImage"
                  disabled={isDesignImageUploaded}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designDetail">Detail</Label>
                <Textarea
                  value={designDetail}
                  onChange={(e) => setDesignDetail(e.target.value)}
                  id="designDetail"
                  placeholder="Describe your design requirements"
                  disabled={isDesignImageUploaded}
                />
              </div>

              {!isDesignImageUploaded && (
                <Button
                  className="bg-gray-950 hover:bg-gray-800 rounded-none mt-6 w-full sm:w-1/2"
                  onClick={uploadDesignImage}
                  disabled={!designImage || !designDetail.trim()}
                >
                  Upload Design
                </Button>
              )}

              {isDesignImageUploaded && (
                <div className="text-green-600 mt-2">
                  Design uploaded successfully!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Section */}
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-20 mb-16">
          {/* Payment Upload */}
          <div className="w-full md:w-[450px] space-y-6 max-sm:order-1">
            <div className="text-xl sm:text-2xl text-center mb-3">
              <Title text1="UPLOAD" text2="PAYMENT SCREENSHOT" />
            </div>

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
          </div>

          {/* Payment Details */}
          <div className="w-full flex items-center flex-col md:w-[450px] space-y-6">
            <div className="text-xl sm:text-2xl mb-3">
              <Title text1="COMPLETE" text2="PAYMENT" />
            </div>

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
        </div>

        {/* Order Summary */}
        <div className="w-full my-8 flex justify-end">
          <div className="min-w-72">
            <div className="text-2xl">
              <Title text1="CART" text2="TOTALS" />
            </div>

            <div className="flex flex-col gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <p>Quantity</p>
                <p>
                  {quantity} {quantity === 1 ? "item" : "items"}
                </p>
              </div>

              <hr className="my-1" />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {currency} {order?.amount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full text-end">
          <Button
            onClick={() => {
              refreshOrders();

              navigate("/orders");
            }}
            className={`bg-gray-950 hover:bg-gray-800 rounded-none w-full sm:w-1/2 lg:w-1/4 ${
              !isPaymentImageUploaded ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!isPaymentImageUploaded}
          >
            PLACE ORDER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
