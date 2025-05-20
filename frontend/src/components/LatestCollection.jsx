import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import ShopMore from "./ShopMore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const LatestCollection = () => {
  const { products} = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <div className="px-2 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="my-10">
        <div className="text-center py-8 text-3xl">
          <Title text1={"LATEST"} text2={"COLLECTIONS"} />
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Discover the freshest styles of the season, curated for
            trendsetters. Stay ahead with the latest fashion must-haves!
          </p>
        </div>

        {/* Rendering Products */}
        <Carousel height={500} className="w-full">
          <CarouselContent className="-ml-1">
            {latestProducts?.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <ProductItem
                  key={index}
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  tag={item.tag}
                  description={item.description}
                  discount={item.discount}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="max-sm:hidden" />
          <CarouselNext className="max-sm:hidden" />
        </Carousel>

        {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-sm:gap-2 gap-4 max-sm:gap-y-4 gap-y-6">
          {latestProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              tag={item.tag}
              description={item.description}
            />
          ))}
        </div> */}
        <ShopMore />
      </div>
    </div>
  );
};

export default LatestCollection;
