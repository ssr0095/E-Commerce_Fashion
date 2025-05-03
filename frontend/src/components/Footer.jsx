import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] bg-gray-50 border-t  mt-40">
      <div className="my-6">
        <img src={assets.logo} className="mb-5 w-32" alt="logo" />
        <p className="w-full md:w-11/12 text-gray-600 text-sm">
          CousinsFashion brings you stylish, high-quality fashion for every
          occasion. Explore trendy clothing and accessories for men and women,
          blending comfort with style. Shop hassle-free with easy payments, fast
          delivery, and custom designs via WhatsApp. Dress with confidence—only
          at CousinsFashion!
        </p>
      </div>
      <hr />
      <div className="flex flex-col sm:grid grid-cols-[1fr_1fr_1fr_1fr] gap-7 sm:gap-14 my-10 text-sm">
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <a href="/" alt="#">
              Home
            </a>
            <a href="/about" alt="#">
              About us
            </a>
            <a href="/collection" alt="#">
              Collection
            </a>
            <a href="#" alt="#">
              Privacy policy
            </a>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">CATEGORY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <a href="#" alt="#">
              Men
            </a>
            <a href="#" alt="#">
              Women
            </a>
            <a href="#" alt="#">
              Aesthetic
            </a>
            <a href="#" alt="#">
              Street style
            </a>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">LEGAL</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <a href="#" alt="#">
              Privacy policy
            </a>
            <a href="#" alt="#">
              Terms & Conditions
            </a>
            <a href="#" alt="#">
              Shipping Policy
            </a>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">NEED HELP?</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <a
              className="flex items-center gap-2  hover:underline"
              alt="whatsapp"
              href="https://wa.me/8248586654?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.%20Can%20you%20help%20me%20with%20sizes%20and%20pricing?"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-phone"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +91 82485 86654
            </a>
            <a
              href="mailto:cousinsfashion2025@gmail.com"
              aria-label="Email Us"
              className="flex items-center gap-2 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mail"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Cousinsfashion2025@gmail.com
            </a>
          </ul>
        </div>
      </div>

      <div className="w-full flex items-center justify-end gap-1 mb-2">
        <p className="text-sm">CONNECT WITH US</p>
        <ul className="flex items-center text-gray-600">
          <a
            href="https://www.instagram.com/cousins_.fashion?igsh=aGZmaXRpNmJ2NWQ2"
            className="p-2"
            alt="instargam"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-instagram"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          {/* <a href="#">O</a>
          <a href="#">O</a> */}
        </ul>
      </div>

      <hr />
      <div className="w-full flex items-center justify-center sm:justify-between py-5 text-xs text-gray-500">
        <p className="max-sm:hidden">
          Privacy Policy <span className="px-1">|</span> Terms of Use
        </p>
        <p>
          © 2025 Cousinsfashion.com <span className="px-1">|</span> All Right
          Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
