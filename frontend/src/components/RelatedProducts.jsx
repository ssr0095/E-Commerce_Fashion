import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();

      productsCopy = productsCopy.filter((item) => category === item.category);
      productsCopy = productsCopy.filter(
        (item) => subCategory === item.subCategory
      );

      setRelated(productsCopy.slice(0, 4));
    }
  }, [products]);

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="my-24">
        <div className=" text-center text-3xl py-2">
          <Title text1={"RELATED"} text2={"PRODUCTS"} />
        </div>

        <div height={500} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-5">
          {related?.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              discount={item.discount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
