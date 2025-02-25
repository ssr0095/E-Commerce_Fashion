import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { toast } from "react-toastify";
import QRCode from "../components/QrCode";
import { assets } from "../assets/assets";
import { useParams } from "react-router-dom";
import SmallNavBar from "../components/SmallNavBar";

const Payment = () => {
  const { token, navigate, backendUrl, currency } = useContext(ShopContext);

  const [image, setImage] = useState(false);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [order, setOrder] = useState(false);
  const { orderId } = useParams();
  const [quantity, setQuantity] = useState(0);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/getuserorder",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        setOrder(response.data.order);

        response.data.order.items.map((item, index) => {
          setQuantity((prev) => prev + item.quantity);
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // console.log(order);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image || image == null || image == undefined) {
      return toast.error("Image not added");
    }
    try {
      const formData = new FormData();

      image && formData.append("image", image);
      formData.append("orderId", orderId);
      // console.log(token);
      const response = await axios.post(
        backendUrl + "/api/order/addScreenShot",
        formData,
        { headers: { token } }
      );
      // console.log(response?.data + " k o");

      if (response.data.success) {
        setIsImageUploaded(true);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Orders", "Payment"]} />

      <div className="border-t pt-7">
        <div className="flex justify-center items-start gap-20 mb-16 flex-col-reverse md:flex-row">
          {/* IMAGE UPLOAD */}
          <div className="w-full md:w-[450px] flex flex-col items-center justify-start space-y-6">
            {/* <form className="flex flex-col items-center space-y-4"> */}
            <div className="text-xl sm:text-2xl mb-3">
              <Title text1={"UPLOAD"} text2={"SCREENSHOT"} />
            </div>

            <label htmlFor="image">
              <div className="w-48 overflow-hidden bg-contain h-48 rounded-lg border-2 bg-gray-200 gap-2 border-gray-500 border-dashed flex items-center justify-center flex-col hover:bg-gray-300">
                <img
                  className={!image ? "w-6 h-6" : "w-full h-fit bg-contain"}
                  src={!image ? assets.upload_area : URL.createObjectURL(image)}
                  alt=""
                  width={24}
                  height={24}
                />
                {!image && (
                  <p className="text-gray-500">
                    Upload{" "}
                    <span className="text-blue-500 underline"> image</span>
                  </p>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="image"
                hidden
              />
            </label>
            <button
              className="bg-gray-950 text-white shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 my-14 px-8 w-48  py-2"
              onClick={onSubmitHandler}
            >
              Upload
            </button>
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
              name="SABARI GIRI"
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
          <button
            onClick={() => navigate("/orders")}
            className={`bg-gray-950 text-white shadow-sm outline-none duration-75 hover:bg-gray-800  active:bg-gray-900 px-8 w-full sm:w-[50%] lg:w-[25%] py-3 ${
              !isImageUploaded && "cursor-not-allowed"
            }`}
            disabled={!isImageUploaded}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
