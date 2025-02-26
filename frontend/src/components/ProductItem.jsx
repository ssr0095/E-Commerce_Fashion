import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({
  id,
  image,
  name,
  price,
  description,
  tag,
  discount,
  isCustomizable = false,
}) => {
  const { currency } = useContext(ShopContext);
  // console.log(tag);
  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={
        isCustomizable
          ? `https://wa.me/8248586654?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.%20Can%20you%20help%20me%20with%20sizes%20and%20pricing?  
`
          : `/product/${id}`
      }
    >
      {/* <div className=" overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt=""
        />
      </div> */}
      <div className="w-full h-[40vh] group overflow-hidden relative">
        <img
          src={image[0]}
          alt="Default"
          className={`w-full h-full object-cover transition duration-300 ${
            image[1] && "group-hover:opacity-0"
          }`}
        />
        {image[1] && (
          <img
            src={image[1]}
            alt="Hover"
            className="absolute top-0 left-0 w-full h-full object-cover transition duration-300 opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
      <p className="w-fit mt-1 px-2 bg-blue-50 border border-blue-200 text-gray-800 text-sm">
        {tag}
      </p>

      <p className="pt-1 text-md text-gray-800 font-semibold">{name}</p>
      <p className="pb-2 text-sm truncate">{description}</p>
      <div className="w-full flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <p className="line-through text-md font-medium">
            {currency}
            {price + Math.round((discount / 100) * price)}
          </p>
          <p className=" text-lg text-gray-800 font-semibold">
            {currency}
            {price}
          </p>
        </div>
        <p className="flex flex-col xl:flex-row  w-fit max-xl:px-1 px-2 py-1 gap-x-1 bg-black text-white text-xs max-xl:text-[10px]">
          {discount}% <span> OFF</span>
        </p>
      </div>
    </Link>
  );
};
export const CategoryItem = ({ name, image }) => {
  const { setSearch, setShowSearch, navigate } = useContext(ShopContext);

  const toMove = (val) => {
    setShowSearch(true);
    setSearch(val);
    navigate("/collection");
  };
  return (
    <Link
      onClick={() => toMove(name)}
      className="relative text-gray-700 cursor-pointer w-full bg-gray-200 group"
      to={`/collection`}
    >
      <div className=" overflow-hidden flex items-center">
        <img
          className="w-full hover:scale-105 transition ease-in-out duration-500"
          src={image}
          alt={name}
        />
      </div>
      <p className="w-fit absolute bottom-5 left-5 bg-white px-4 z-10 py-2 border border-gray-700 text-xs lg:text-sm text-center hover:underline underline-offset-2">
        {name.toUpperCase()}{" "}
        <span className="hidden group-hover:inline-block"> &rarr;</span>
      </p>
    </Link>
  );
};

export default ProductItem;
