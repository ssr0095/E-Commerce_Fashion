import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import SmallNavBar from "../components/SmallNavBar";
import { toast } from "react-toastify";
import Coupon from "../components/Coupon";
import ProductDetailsDrop from "../components/ProductDetailsDrop";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  const buy = () => {
    if (size) {
      addToCart(productData._id, size);
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
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
              {productData.image.map((item, index) => (
                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                  alt=""
                />
              ))}
            </div>
            <div className="w-full sm:w-[80%]">
              <img className="w-full h-auto" src={image} alt="" />
            </div>
          </div>

          {/* -------- Product Info ---------- */}
          <div className="flex-1  cursor-default">
            <p className="w-fit mt-1 px-3 py-1 bg-blue-50 border border-blue-200 text-gray-800 text-sm">
              {productData.tag.toUpperCase()}
            </p>
            <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
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
                {productData.price +
                  Math.round((productData.discount / 100) * productData.price)}
              </p>{" "}
              <p>
                {currency}
                {productData.price}
              </p>
              <p className="flex items-center min-w-fit max-w-[30%]  px-2 py-1 bg-green-50 text-green-500 outline-offset-2 outline-[1.5px] outline-dashed outline-green-500 text-xs ml-5">
                {productData.discount}% OFFER
              </p>
            </div>
            <p className="text-xs text-gray-500">MRP Inclusive of all taxes</p>

            <p className="mt-5 text-gray-500 md:w-4/5">
              {productData.description}
            </p>
            <div className="flex flex-col gap-4 my-8">
              <p>Select Size</p>
              <div className="flex gap-2">
                {productData.sizes.map((item, index) => (
                  <button
                    onClick={() => setSize(item)}
                    className={`border py-2 px-4 bg-gray-100 ${
                      item === size ? "border-orange-500" : ""
                    }`}
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => addToCart(productData._id, size)}
              className="min-w-[30%] w-full bg-black text-white px-8 py-3 text-sm mb-2 active:bg-gray-700"
            >
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
          category={productData.category}
          subCategory={productData.subCategory}
        />
      </div>
    </div>
  ) : (
    <div className=" opacity-0"></div>
  );
};

export default Product;
