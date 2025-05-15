import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import SmallNavBar from "../components/SmallNavBar";
import { toast } from "react-toastify";
import Coupon from "../components/Coupon";
import ProductDetailsDrop from "../components/ProductDetailsDrop";
import { assets } from "../assets/assets";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ruler, ArrowUpRight } from "lucide-react";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, navigate, customizableProducts } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState(null);

  const fetchProductData = async () => {
    const allProducts = [...products, ...customizableProducts]; // merge both
    const found = allProducts.find((item) => item._id === productId);
    if (found) {
      setProductData(found);
      setImage(found?.image[0]);
    }
  };

  const buy = () => {
    if (size) {
      addToCart(productData?._id, size);
      navigate("/cart");
    } else {
      toast.error("Select Product Size");
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  return productData ? (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Collection", "Product"]} />
      <div className="border-t pt-10 transition-opacity ease-in duration-500 opacity-100">
        {/*----------- Product Data-------------- */}
        <div className="flex gap-5 sm:gap-7 flex-col sm:flex-row">
          {/*---------- Product Images------------- */}
          <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-start gap-3 sm:justify-normal sm:w-[18.7%] w-full">
              {productData?.image.map((item, index) => (
                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  className="w-[24%] sm:w-full aspect-[3/4] sm:mb-3 flex-shrink-0 cursor-pointer"
                  alt={`product image ${index}`}
                  loading="lazy"
                />
              ))}
            </div>
            <div className="w-full">
              <img className="w-full aspect-[3/4]" src={image} alt="image" loading="eager"/>
            </div>
          </div>

          {/* -------- Product Info ---------- */}
          <div className="flex-1  cursor-default">
            <p className="w-fit mt-1 px-3 py-1 bg-blue-50 border border-blue-200 text-gray-800 text-sm">
              {productData?.tag?.toUpperCase()}
            </p>
            <h1 className="font-medium text-2xl mt-2">{productData?.name}</h1>
            {/* <div className=" flex items-center gap-1 mt-2">
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_icon} alt="" className="w-3 5" />
              <img src={assets.star_dull_icon} alt="" className="w-3 5" />
              <p className="pl-2">(122)</p>
            </div> */}
            <div className="flex items-center gap-3 mt-3 text-3xl font-medium">
              <p className="line-through text-xl text-gray-500 font-medium">
                {currency}
                {productData?.price +
                  Math.round(
                    (productData?.discount / 100) * productData?.price
                  )}
              </p>{" "}
              <p>
                {currency}
                {productData?.price}
              </p>
              <p className="flex items-center min-w-fit max-w-[30%]  px-2 py-1 bg-green-50 text-green-500 outline-offset-2 outline-[1.5px] outline-dashed outline-green-500 text-xs ml-5">
                {productData?.discount}% OFFER
              </p>
            </div>
            <p className="text-xs text-gray-500">MRP Inclusive of all taxes</p>

            <p className="mt-5 text-gray-500 text-justify leading-snug md:w-4/5">
              {productData?.description}
            </p>
            <div className="w-full flex flex-col gap-4 my-8">
              <div className="flex items-center gap-3">
                <p className="font-medium">Select Size</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex items-center text-xs gap-2 px-2 py-1 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100">
                      <Ruler className="w-5 " />
                      Size guide
                      <ArrowUpRight className="w-4 " />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="max-md:w-[30%] w-[60%] overflow-scroll">
                    <img
                      src={assets.size}
                      alt="size chart"
                      width={1020}
                      height={630}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* <ScrollArea> */}
              <div className="w-full flex gap-2 max-sm:overflow-scroll">
                {productData?.sizes.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSize(item)}
                    className={`py-2 px-4 border ${
                      item === size
                        ? "bg-[#1fd1966e] border-[#1fd196]"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {/* </ScrollArea> */}
            </div>

            <button
              onClick={() => addToCart(productData?._id, size)}
              className="min-w-[30%] w-full bg-black text-white px-8 py-3 text-sm mb-2 active:bg-gray-700"
            >
              {/* {console.log(productData?._id, size)} */}
              ADD TO CART
            </button>
            <button
              onClick={() => buy()}
              className="min-w-[30%] w-full bg-white text-black px-8 py-3 text-sm border border-gray-500 active:bg-gray-700"
            >
              BUY
            </button>
            <hr className="mt-8 sm:w-4/5" />
          </div>
        </div>

        <div className="w-full flex flex-col-reverse items-center justify-end md:flex-row gap-10">
          {/* COUPON */}
          <Coupon />
          <div className="w-full md:w-[80%] lg:w-[48%]">
            <ProductDetailsDrop />
          </div>
          {/* <hr className="sm:w-4/5" /> */}
        </div>

        {/* ---------- Description & Review Section ------------- */}
        {/* <div className="mt-20">
          <div className="flex">
            <b className="border px-5 py-3 text-sm">Description</b>
            <p className="border px-5 py-3 text-sm">Reviews (122)</p>
          </div>
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>
              An e-commerce website is an online platform that facilitates the
              buying and selling of products or services over the internet. It
              serves as a virtual marketplace where businesses and individuals
              can showcase their products, interact with customers, and conduct
              transactions without the need for a physical presence. E-commerce
              websites have gained immense popularity due to their convenience,
              accessibility, and the global reach they offer.
            </p>
            <p>
              E-commerce websites typically display products or services along
              with detailed descriptions, images, prices, and any available
              variations (e.g., sizes, colors). Each product usually has its own
              dedicated page with relevant information.
            </p>
          </div>
        </div> */}

        {/* --------- display related products ---------- */}

        <RelatedProducts
          category={productData?.category}
          subCategory={productData?.subCategory}
        />
      </div>
    </div>
  ) : (
    <div className=" opacity-0"></div>
  );
};

export default Product;
