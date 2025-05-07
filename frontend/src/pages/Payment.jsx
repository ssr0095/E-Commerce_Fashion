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
  const { token, navigate, backendUrl, currency } = useContext(ShopContext);
  const [isLoading, setIsLoading] = useState(false);

  const [paymentImage, setPaymentImage] = useState(false);
  const [isPaymentImageUploaded, setIsPaymentImageUploaded] = useState(false);
  const [order, setOrder] = useState(false);
  const { orderId } = useParams();
  const [quantity, setQuantity] = useState(0);

  const [isCustom, setIsCustom] = useState(false);
  const [designImage, setDesignImage] = useState(false);
  const [designDetail, setDesignDetail] = useState("");
  const [isDesignImageUploaded, setDesignIsImageUploaded] = useState(false);
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 3 * 1024 * 1024; // 3MB

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      setIsLoading(true);

      const response = await axios.post(
        backendUrl + "/api/order/getuserorder",
        { orderId },
        { headers: { token } }
      );
      setIsLoading(false);

      if (response.data.success) {
        const orderData = response.data.order;
        setOrder(orderData);

        // Set quantity
        orderData.items.forEach((item) => {
          setQuantity((prev) => prev + item.quantity);
        });

        // ✅ Check for customizable items
        const hasCustomItem = orderData.items.some(
          (item) => item.customizable === true
        );
        setIsCustom(hasCustomItem);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const validateFile = (file, input) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, AVIF, or WEBP images are allowed.");
      input.value = "";
      return false;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 3MB.");
      input.value = "";
      return false;
    }
    return true;
  };

  const compressImage = async (file) => {
    const options = { 
      maxSizeMB: 1,          // Compress to ≤1MB
      maxWidthOrHeight: 1920 // Resize if needed
    };
    return await imageCompression(file, options);
  };

  const handleFileChange = (e) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!validateFile(file, fileInput)) return;

    setPaymentImage(file);
  };

  const handleDesinFileChange = (e) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!validateFile(file, fileInput)) return;

    setDesignImage(file);
  };

  const onSubmitDesignImageHandler = async () => {
    if (!designImage) return toast.error("Design image not selected");
    if (!designDetail.trim()) return toast.error("Design detail required");

    setIsLoading(true);
    try {
      const designFormData = new FormData();
      designFormData.append("orderId", orderId);
      designFormData.append("designImage", await compressImage(designImage));
      designFormData.append("designDetail", designDetail);

      const response = await axios.post(
        backendUrl + "/api/order/addDesignImage",
        designFormData,
        { headers: { token } }
      );

      if (response.data.success) {
        setDesignIsImageUploaded(true);
        toast.success("Design image uploaded");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPaymentImageHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!paymentImage) {
      setIsLoading(false);
      return toast.error("Payment screenshot not added");
    }
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (isCustom) {
      if (!isDesignImageUploaded) {
        setIsLoading(false);
        return toast.error("Design image not selected");
      }
      if (!designDetail.trim()) {
        setIsLoading(false);
        return toast.error("Design detail required");
      }
    }

    try {
      const paymentFormData = new FormData();
      paymentFormData.append("orderId", orderId);
      paymentFormData.append("paymentImage", paymentImage);

      const paymentResponse = await axios.post(
        backendUrl + "/api/order/addPaymentScreenshot",
        paymentFormData,
        { headers: { token } }
      );

      if (!paymentResponse.data.success) {
        setIsLoading(false);
        return toast.error(paymentResponse.data.message);
      }

      setIsPaymentImageUploaded(true);
      toast.success("Payment screenshot uploaded");

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || "Something went wrong");
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      {isLoading && <Loader />}

      <SmallNavBar navs={["Orders", "Payment"]} />

      <div className="border-t pt-7">
        {isCustom && (
          <>
            <div className="text-xl sm:text-2xl my-3">
              <Title text1={"DESIGN"} text2={"INFORMATION"} />
            </div>
            <div className="w-full max-w-lg flex items-start flex-col gap-3  mb-16">
              {/* <div className="grid w-full max-w-sm items-center gap-1.5"> */}
              <Label htmlFor="designImage">Upload design</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleDesinFileChange}
                name="designImage"
                id="designImage"
                required
              />
              <Label htmlFor="designDetail">Detail</Label>
              <Textarea
                onChange={(e) => setDesignDetail(e.target.value)}
                name="designDetail"
                value={designDetail}
                type="text"
                placeholder="Write details about your design"
                required
              />
              <Button
                className="bg-gray-950 text-white rounded-none shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 my-6 px-8 w-full sm:w-[50%] py-2"
                onClick={onSubmitDesignImageHandler}
              >
                Upload
              </Button>
            </div>
          </>
        )}
        <div className="flex justify-center items-start gap-20 mb-16 flex-col-reverse md:flex-row">
          {/* IMAGE UPLOAD */}
          <div className="w-full md:w-[450px] flex flex-col items-center justify-start space-y-6">
            {/* <form className="flex flex-col items-center space-y-4"> */}
            <div className="text-xl text-center sm:text-2xl mb-3">
              <Title text1={"UPLOAD"} text2={"PAYMENT SCREENSHOT"} />
            </div>

            <Label htmlFor="paymentImage">
              <div className="w-48 overflow-hidden bg-contain h-48 rounded-lg border-2 bg-gray-200 gap-2 border-gray-500 border-dashed flex items-center justify-center flex-col hover:bg-gray-300">
                <img
                  className={
                    !paymentImage ? "w-6 h-6" : "w-full h-fit bg-contain"
                  }
                  src={
                    !paymentImage
                      ? assets.upload_area
                      : URL.createObjectURL(paymentImage)
                  }
                  alt="upload"
                  width={24}
                  height={24}
                />
                {!paymentImage && (
                  <p className="text-gray-500">
                    Upload{" "}
                    <span className="text-blue-500 underline"> image</span>
                  </p>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                name="paymentImage"
                id="paymentImage"
                hidden
              />
            </Label>
            <Button
              className="bg-gray-950 text-white rounded-none shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 my-14 px-8 w-48  py-2"
              onClick={onSubmitPaymentImageHandler}
              disabled={isCustom && !isDesignImageUploaded}
            >
              Upload
            </Button>
            {/* </form> */}
          </div>

          {/* -----------RIGHT SIDE------------- */}
          <div className="w-full md:w-[450px] flex flex-col items-center space-y-4">
            <div className="text-xl sm:text-2xl mb-2">
              <Title text1={"COMPLETE"} text2={"PAYMENT"} />
            </div>
            <div className="flex items-center gap-2">
              <img src={assets.ok_icon} alt="ok" width={24} height={24} />
              <h1 className="text-3xl font-bold">
                {currency + "" + order?.amount}
              </h1>
            </div>
            <QRCode
              upiId={import.meta.env.VITE_UPI}
              amount={`${order?.amount}`}
              name={import.meta.env.VITE_BANKNAME}
            />
          </div>
        </div>

        {/* -------------CART TOTAL---------------- */}
        <div className="w-full my-8 flex items-center justify-end">
          <div className="min-w-72">
            <div className="text-2xl">
              <Title text1={"CART"} text2={"TOTALS"} />
            </div>

            <div className="flex flex-col gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <p>Quantity</p>
                <p>
                  {quantity} {quantity > 1 ? "items" : "item"}
                </p>
              </div>
              <hr />
              <div className="flex justify-between">
                <b>Total</b>
                <b>
                  {currency} {order?.amount}
                  .00
                </b>
              </div>
            </div>
          </div>
        </div>
        <div className=" w-full text-end">
          <Button
            onClick={() => navigate("/orders")}
            className={`bg-gray-950 text-white rounded-none shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 px-8 w-full sm:w-[50%] lg:w-[25%] py-3 ${
              !isPaymentImageUploaded && "cursor-not-allowed"
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
