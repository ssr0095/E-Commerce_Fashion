import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { CategoryItem } from "./ProductItem";
import { category } from "../assets/assets";

const ShopByCategory = () => {

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="mt-16 mb-20">
        <div className=" text-center text-3xl py-2">
          <Title text1={"SHOP BY"} text2={"CATEGORY"} />
        </div>

        <div className="w-full h-[90%] grid grid-cols-1 sm:grid-cols-3 items-center justify-center gap-3">
          {category.map((item, index) => (
            <CategoryItem key={index} name={item.name} image={item.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByCategory;
