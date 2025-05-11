import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  House,
  LibraryBig,
  Settings2,
  Building2,
  ArrowLeft,
  AlignRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "HOME", path: "/", icon: <House className="w-5" /> },
  {
    name: "COLLECTION",
    path: "/collection",
    icon: <LibraryBig className="w-5" />,
  },
  {
    name: "CUSTOMIZE",
    path: "/customize",
    icon: <Settings2 className="w-5" />,
  },
  { name: "ABOUT", path: "/about", icon: <Building2 className="w-5" /> },
];

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {
    toggleSearch,
    cartCount,
    navigate,
    token,
    logout,
    user,
    whatsappNumber,
  } = useContext(ShopContext);

  const handleCloseSidebar = () => setVisible(false);

  return (
    <>
      {/* Promo Banner */}
      <div className="w-full flex items-center justify-center text-white bg-black py-3 px-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white">
          <p className="max-sm:text-xs text-sm/6">
            <span className="max-sm:hidden">
              <strong className="font-semibold">Limited Time Offer</strong>
              <svg
                viewBox="0 0 2 2"
                aria-hidden="true"
                className="mx-2 inline size-0.5 fill-current"
              >
                <circle r={1} cx={1} cy={1} />
              </svg>
              Apply Code -{" "}
              <strong className="font-semibold">
                {import.meta.env.VITE_COUSINS_COUPION}
              </strong>{" "}
            </span>
            Get 10% Off on First Order
          </p>
          <Link
            to="/collection"
            className="flex items-center rounded-full bg-gray-900 px-3.5 py-1 max-sm:text-xs text-sm font-semibold text-white shadow-xs hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            Shop now <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 left-0 flex w-full items-center justify-center px-5 py-3 sm:px-10 backdrop-blur-xl z-40">
        <nav className="screen-max-width flex w-full">
          <Link to="/" aria-label="Home">
            <img
              src="/logo.png"
              className="w-24"
              alt="Cousins Fashion"
              width={96}
              height={18}
              loading="lazy"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="flex w-full flex-1 items-center justify-center max-md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `cursor-pointer px-5 text-sm transition-all hover:scale-105 ${
                    isActive ? "text-black font-medium" : "text-gray-600"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-6 sm:gap-7 max-md:flex-1 max-md:justify-end">
            <button
              onClick={() => {
                toggleSearch(true);
                navigate("/collection");
              }}
              aria-label="Search"
            >
              <img
                src={assets.search_icon}
                className="w-5 cursor-pointer"
                alt="Search"
                loading="lazy"
              />
            </button>

            {/* Profile Dropdown */}
            <div className="flex items-center group relative shrink-0">
              {token ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button aria-label="Account menu">
                      <img
                        className="w-[17px] cursor-pointer"
                        src={assets.profile_icon}
                        alt="Profile"
                        // loading="lazy"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem disabled>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {user?.name}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user?.email}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        My coupon: {user?.coupon || "--"}
                        <button
                          className="ml-2 p-1 rounded-md text-xs text-gray-600 hover:bg-gray-200"
                          onClick={async () =>
                            user?.coupon &&
                            navigator.clipboard.writeText(user.coupon)
                          }
                          aria-label="Copy coupon code"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        My orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button onClick={() => navigate("/login")} aria-label="Login">
                  <img
                    className="w-[17px] cursor-pointer"
                    src={assets.profile_icon}
                    alt="Login"
                    loading="lazy"
                  />
                </button>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative" aria-label="Cart">
              <img
                src={assets.cart_icon}
                className="w-5 min-w-5"
                alt="Cart"
                loading="lazy"
              />
              {cartCount > 0 && (
                <span className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* WhatsApp */}
            <Link
              to={`https://wa.me/${whatsappNumber}?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 max-md:hidden"
              aria-label="Contact on WhatsApp"
            >
              <img
                src={assets.whatsapp_icon_02}
                className="w-7"
                alt="WhatsApp"
                loading="lazy"
              />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setVisible(true)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <AlignRight className="w-6 cursor-pointer" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white z-50 transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!visible}
      >
        <div className="p-4 flex flex-col gap-3 text-gray-800">
          <button
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleCloseSidebar}
            aria-label="Close menu"
          >
            <ArrowLeft className="w-5" />
            <span>Back</span>
          </button>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleCloseSidebar}
              className={({ isActive }) =>
                `flex items-center justify-start gap-4 py-2 pl-4 border-b ${
                  isActive ? "text-black font-medium" : "text-gray-600"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
          <Link
            to={`https://wa.me/${whatsappNumber}?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCloseSidebar}
            className="flex items-center justify-start gap-4 py-2 pl-4 border-b  text-gray-600"
          >
            <img src={assets.whatsapp_icon_02} className="w-6" alt="WhatsApp" />
            WHATSAPP
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
