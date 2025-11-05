import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";
import SmallNavBar from "../components/SmallNavBar";
import { toast } from "sonner";
import Coupon from "../components/Coupon";
import ProductDetailsDrop from "../components/ProductDetailsDrop";
import { assets } from "../assets/assets";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/components/ui/carousel";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Ruler, ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import CartSyncIndicator from "../components/CartSyncIndicator";
import axios from "axios";

const Product = () => {
  const { slug } = useParams();
  const { products, currency, addToCart, navigate, customizableProducts, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getCartSyncStatus } = useContext(ShopContext);
  const [status, setStatus] = useState({ pending: 0, isProcessing: false });

  const fetchProductData = async () => {
    try {
      setLoading(true);

      // First try to find in local state (for faster navigation)
      const allProducts = [...products, ...customizableProducts];
      const found = allProducts.find((item) => item.slug === slug);

      if (found) {
        setProductData(found);
        setImage(found?.image[0]);
        setLoading(false);
        return;
      }

      // If not found locally, fetch from API
      const response = await axios.get(`${backendUrl}/api/product/single/${slug}`);

      if (response.data?.success) {
        setProductData(response.data.product);
        setImage(response.data.product?.image[0]);
      } else {
        console.error("Product not found");
        navigate("/404"); // Redirect to 404 page
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const buy = () => {
    if (size) {
      addToCart(productData?._id, size);
      navigate("/cart");
    } else {
      toast.error("Please select a size");
    }
  };

  // Generate schema markup
  const generateProductSchema = () => {
    if (!productData) return null;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: productData?.name,
      image: productData?.image,
      description: productData?.description,
      sku: productData?._id,
      brand: {
        "@type": "Brand",
        name: "Cousins Fashion",
        url: "https://cousinsfashion.in",
        logo: "https://cousinsfashion.in/logo.webp",
      },
      offers: {
        "@type": "Offer",
        url: `https://cousinsfashion.in/product/${
          productData?.slug || productData?._id
        }`,
        priceCurrency: "INR",
        price: productData?.price,
        // priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: "https://schema.org/NewCondition",
        availability: "https://schema.org/InStock",
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "INR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "IN",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: "1",
              maxValue: "2",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: "3",
              maxValue: "7",
            },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          returnPolicyCategory:
            "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
        seller: {
          "@type": "Organization",
          name: "Cousins Fashion",
          sameAs: "https://cousinsfashion.in",
        },
      },
      aggregateRating: productData?.ratings
        ? {
            "@type": "AggregateRating",
            ratingValue: productData.ratings.average,
            reviewCount: productData.ratings.count,
          }
        : undefined,
    };

    return JSON.stringify(schema, (key, value) =>
      value === undefined ? undefined : value
    );
  };

  useEffect(() => {
    if (slug) {
      fetchProductData();
    }
  }, [slug, products]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getCartSyncStatus());
    }, 500);

    return () => clearInterval(interval);
  }, [getCartSyncStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner className="size-12" />
      </div>
    );
  }

  return productData ? (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Helmet>
        <title>{`${productData?.name} | Buy Now | Cousins Fashion`}</title>
        <meta name="description" content={productData?.description} />
        <link
          rel="canonical"
          href={`https://cousinsfashion.in/product/${
            productData?.slug || productData?._id
          }`}
        />
        {/* Open Graph */}
        <meta
          property="og:title"
          content={`${productData?.name} | Cousins Fashion`}
        />
        <meta property="og:description" content={productData?.description} />
        <meta property="og:image" content={productData?.image[0]} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Cousins Fashion" />
        <meta
          property="og:url"
          content={`https://cousinsfashion.in/product/${
            productData?.slug || productData?._id
          }`}
        />
        <meta property="product:brand" content="Cousins Fashion" />
        <meta property="product:retailer_item_id" content={productData?._id} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${productData?.name} | Cousins Fashion`}
        />
        <meta
          name="twitter:description"
          content={productData?.description.substring(0, 200)}
        />
        <meta name="twitter:image" content={productData?.image[0]} />

        <script type="application/ld+json">{generateProductSchema()}</script>
      </Helmet>
      <SmallNavBar
        navs={[
          productData.customizable ? "Customize" : "Collection",
          "Product",
        ]}
      />
      <div className="border-t pt-10 transition-opacity ease-in duration-500 opacity-100">
        {/*----------- Product Data-------------- */}
        <div className="flex gap-5 sm:gap-7 flex-col sm:flex-row">
          {/*---------- Product Images------------- */}
          <div className="flex-1 flex max-sm:flex-col gap-3">
            <div className="flex sm:flex-col max-sm:order-2 sm:overflow-y-scroll justify-start gap-3 w-[19%]">
              {productData?.image.map((item, index) => (
                <img
                  onClick={() => setImage(item)}
                  src={item}
                  key={index}
                  className="w-full aspect-[3/4] flex-shrink-0 cursor-pointer"
                  alt={`product image ${index}`}
                  loading="lazy"
                />
              ))}
            </div>
            <div className="w-full max-sm:hidden">
              <img
                className="w-full aspect-[3/4]"
                src={image}
                alt="image"
                loading="eager"
              />
            </div>
            <div className="w-full sm:hidden">
              <Carousel
                // plugins={[plugin.current]}
                className="w-full"
                // onMouseEnter={plugin.current.stop}
                // onMouseLeave={plugin.current.play}
              >
                <CarouselContent>
                  {productData?.image.map((item, index) => (
                    <CarouselItem key={index}>
                      <img
                        // onClick={() => setImage(item)}
                        src={item}
                        key={index}
                        className="w-full aspect-[3/4]"
                        alt={`product image ${index}`}
                        loading={index == 0 ? "eager" : "lazy"}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* <CarouselPrevious /> 
                <CarouselNext /> */}
              </Carousel>
              {/* <img className="w-full aspect-[3/4]" src={image} alt="image" loading="eager"/> */}
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
                {Math.ceil(
                  (productData?.price / (100 - productData?.discount)) * 100
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

            <Button
              onClick={() => {
                if (!size) {
                  return toast.error("Please select a size");
                }
                const success = addToCart(productData?._id, size);

                if (success) {
                  toast.success("Product added to cart");
                } else {
                  toast.error("Failed to add to cart");
                }
              }}
              className="min-w-[30%] rounded-none px-8 w-full py-3"
              disabled={status.isProcessing && status.pending !== 0}
            >
              {status.isProcessing && status.pending !== 0 ? (
                <>
                  <CartSyncIndicator /> Loading...
                </>
              ) : (
                "ADD TO CART"
              )}
            </Button>
            <Button
              onClick={() => buy()}
              className="min-w-[30%] rounded-none my-4 px-8 w-full py-3"
              variant="outline"
            >
              BUY NOW
            </Button>
            <hr className="mt-8 sm:w-4/5" />
          </div>
        </div>

        <div className="w-full flex flex-col-reverse items-center justify-end md:mt-10 md:flex-row gap-10">
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
    <div className="flex justify-center items-center min-h-[50vh]">
      <p>Product not found</p>
    </div>
  );
};

export default Product;
