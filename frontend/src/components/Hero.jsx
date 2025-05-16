import React from "react";
import { assets } from "../assets/assets";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/components/ui/carousel";

const Hero = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 2200, stopOnInteraction: true, loop: true })
  );

  const bg = [assets.bg_02, assets.bg_03];
  return (
    <div className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.play}
      >
        <CarouselContent>
          <CarouselItem>
            <img
              src={assets.bg_01}
              className="w-full max-h-screen"
              alt={"Hero image 0"}
              // width={1080}
              // height={630}
              loading="eager"
              fetchpriority="high"
            />
          </CarouselItem>
          {bg.map((img, index) => (
            <CarouselItem key={index}>
              <img
                src={img}
                className="w-full max-h-screen"
                alt={"Hero image " + index + 1}
                // width={1080}
                // height={630}
              fetchpriority="low"
                loading="lazy"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselPrevious /> */}
        {/* <CarouselNext /> */}
      </Carousel>
    </div>
  );
};

export default Hero;
