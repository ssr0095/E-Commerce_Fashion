import React from "react";
import { assets } from "../assets/assets";

const InfiniteBanner = () => {
  return (
    <div className="w-full mx-auto px-4 md:px-5 py-4 md:py-6 shadow-2xl shadow-gray-100">
      <div className="text-center">
        <div
          x-data="{}"
          x-init="$nextTick(() => {
                        let ul = $refs.logos;
                        ul.insertAdjacentHTML('afterend', ul.outerHTML);
                        ul.nextSibling.setAttribute('aria-hidden', 'true');
                    })"
          className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
        >
          <ul
            x-ref="logos"
            className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
          >
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
          </ul>
          <ul
            x-ref="logos"
            className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll"
          >
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
            <li>
              <img src={assets.logo} alt="logo" className="w-24 md:w-32" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfiniteBanner;
