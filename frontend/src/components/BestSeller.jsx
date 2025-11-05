import React, { useContext, useEffect, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";

const BestSeller = () => {
  const { bestSellerProducts, loading } = useContext(ShopContext);

  return (
    <div className="px-2 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="my-10">
        <div className="text-center text-3xl py-8">
          <Title text1={"BEST"} text2={"SELLERS"} />
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Browse our top-selling pieces loved by shoppers. These trendy
            favorites are selling fast—grab yours before they’re gone!
          </p>
        </div>

        {bestSellerProducts.length > 0 ? (
          <>
            <Carousel height={500} className="w-full">
              <CarouselContent className="-ml-1">
                {bestSellerProducts.map((item, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/5"
                  >
                    <ProductItem
                      key={index}
                      id={item._id}
                      slug={item.slug}
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
            <ShopMore />
          </>
        ) : (
          <div className="w-full flex items-center justify-center py-10 text-gray-500">
            {loading ? <Spinner className="size-9" /> : "No products found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSeller;
