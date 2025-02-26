import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SmallNavBar from "../components/SmallNavBar";
import { assets } from "../assets/assets";

const Customize = () => {
  const { customizableProducts } = useContext(ShopContext);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <SmallNavBar navs={["Customize"]} />
      <div className="flex flex-col pt-5 border-t">
        <div className="flex flex-col items-center justify-center min-h-[50%] mb-10 p-6">
          <div className="bg-gray-50 shadow-xl rounded-2xl p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Customize Your Outfit
            </h2>
            <p className="text-gray-600 mb-6">
              Want a personalized design? Get in touch with us to customize your
              outfit just the way you like it!
            </p>
            <a
              href="https://wa.me/8248586654?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.%20Can%20you%20help%20me%20with%20customization%20and%20pricing?"
              target="_blank"
              // rel="noopener noreferrer"
              className="flex items-center gap-3 justify-center bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-md transition hover:bg-green-600"
            >
              {/* <span>
              </span>{" "} */}
              <img src={assets.whatsapp_icon_01} width={24} />
              Chat on Whatsapp
            </a>
          </div>
        </div>

        <div className="sm:text-2xl mb-4">
          <Title text1={"CUSTOMIZE"} text2={"PRODUCTS"} />
        </div>
        {/* Map Products */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {customizableProducts?.map((item, index) => (
              <ProductItem
                key={index}
                name={item.name}
                id={item._id}
                price={item.price}
                image={item.image}
                tag={item.tag}
                description={item.description}
                discount={item.discount}
                isCustomizable={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
