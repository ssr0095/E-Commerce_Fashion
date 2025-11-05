import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SmallNavBar from "../components/SmallNavBar";
import { assets } from "../assets/assets";
import { Helmet } from "react-helmet-async";
import { Spinner } from "@/components/ui/spinner";

const Customize = () => {
  const { customizableProducts, loading } = useContext(ShopContext);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[50vh]">
  //       <Spinner className="size-12" />
  //     </div>
  //   );
  // }

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Helmet>
        {/* Basic */}
        <title>Customize — Cousins Fashion</title>
        <meta
          name="title"
          content="Customize Your Style | Personalized Streetwear T-Shirts"
        />
        <meta
          name="description"
          content="Create your own vibe with customizable t-shirts. Cousins Fashion offers personal prints, oversized fits, and vintage aesthetics – tailored your way."
        />
        <link rel="canonical" href={"https://cousinsfashion.in/customize"} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Customize — Cousins Fashion" />
        <meta
          property="og:description"
          content="Create your own vibe with customizable t-shirts. Cousins Fashion offers personal prints, oversized fits, and vintage aesthetics – tailored your way."
        />
        <meta
          property="og:url"
          content={"https://cousinsfashion.in/customize"}
        />
        <meta property="og:image" content={customizableProducts[0]?.image[0]} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <SmallNavBar navs={["Customize"]} />
      <div className="flex flex-col pt-10 border-t">
        <div className="sm:text-2xl mb-4">
          <Title text1={"CUSTOMIZE"} text2={"PRODUCTS"} />
        </div>

        {/* Map Products */}
        {customizableProducts?.length > 0 ? (
          <div className="w-fll grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
            {customizableProducts.map((item, index) => (
              <ProductItem
                key={index}
                name={item.name}
                id={item._id}
                slug={item.slug}
                price={item.price}
                image={item.image}
                tag={item.tag}
                description={item.description}
                discount={item.discount}
                // isCustomizable={true}
              />
            ))}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-10 text-gray-500">
            {loading ? (
              <>
                <Spinner /> Loading products..."
              </>
            ) : (
              "No products found."
            )}{" "}
          </div>
        )}

        {/* ------WHATSAPP------ */}
        <div className="flex flex-col items-center justify-center min-h-[50%] mt-16 p-6">
          <div className="bg-gray-50 shadow-xl rounded-2xl p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Have More Ideas or Questions?
            </h2>
            <p className="text-gray-600 mb-6">
              If you’d like to share more design ideas, clarify details, or have
              any doubts about your custom outfit, feel free to reach out. We're
              just a message away and happy to help!
            </p>
            <a
              href="https://wa.me/8248586654?text=Hey!%20I%20have%20a%20few%20ideas%20and%20questions%20about%20customizing%20my%20order.%20Can%20you%20help%20me?"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 justify-center bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-md transition hover:bg-green-600"
            >
              <img
                src={assets.whatsapp_icon_01}
                width={24}
                alt="whatsapp"
                loading="lazy"
              />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
