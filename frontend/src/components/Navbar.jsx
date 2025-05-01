import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "HOME", path: "/" },
  { name: "COLLECTION", path: "/collection" },
  { name: "CUSTOMIZE", path: "/customize" },
  { name: "ABOUT", path: "/about" },
];

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    userInfo,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await userInfo();
      setUser(fetchedUser?.data);
    };

    fetchUser();
  }, [userInfo]);

  const handleCloseSidebar = () => setVisible(false);

  return (
    <>
      {/* BANNER */}
      {/* <Banner /> */}
      <div className="w-full flex items-center justify-center text-white bg-black py-3 px-4 ">
        {/* <p>
          Special offer |{" "}
          <a href="#" className="font-bold underline">
            Sale
          </a>
        </p> */}
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

      <header className="sticky top-0 left-0 flex w-full items-center justify-center px-5 py-3 sm:px-10 backdrop-blur-xl z-40">
        <nav className="screen-max-width flex w-full">
          <Link to="/">
            <img
              src={assets.logo}
              className="w-24"
              alt="logo"
              width={96}
              height={18}
            />
          </Link>
          {/* NAVIGATION */}
          <div className="flex w-full flex-1 items-center justify-center max-md:hidden">
            <NavLink
              to="/"
              className="cursor-pointer px-5 text-sm text-gray transition-all hover:scale-105"
            >
              HOME
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink
              to="/collection"
              className="cursor-pointer px-5 text-sm text-gray transition-all hover:scale-105"
            >
              COLLECTION
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink
              to="/customize"
              className="cursor-pointer px-5 text-sm text-gray transition-all hover:scale-105"
            >
              CUSTOMIZE
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
            <NavLink
              to="/about"
              className="cursor-pointer px-5 text-sm text-gray transition-all hover:scale-105"
            >
              ABOUT
              <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
            </NavLink>
          </div>

          {/* icon nav */}
          <div className="flex items-center gap-7 max-md:flex-1 max-md:justify-end">
            <img
              onClick={() => {
                setShowSearch(true);
                navigate("/collection");
              }}
              src={assets.search_icon}
              className="w-5 cursor-pointer"
              alt="search"
            />
            <div className="group relative shrink-0">
              {!token && (
                <img
                  onClick={() => navigate("/login")}
                  className="w-[17px] cursor-pointer"
                  src={assets.profile_icon}
                  alt="profile"
                />
              )}
              {/* Dropdown Menu */}
              {token && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <img
                      onClick={() => (token ? null : navigate("/login"))}
                      className="w-[17px] cursor-pointer"
                      src={assets.profile_icon}
                      alt="profile"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem disabled>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            @{user?.name}
                          </span>
                          <span className="text-muted-foreground truncate text-xs">
                            {user?.email}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        My coupon: {!user ? "--" : user.coupon}
                        <DropdownMenuShortcut
                          className="px-2 py-1 rounded-md text-xs text-gray-600 hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                          onClick={async () =>
                            user &&
                            (await navigator.clipboard.writeText(user?.coupon))
                          }
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
                            className="lucide lucide-copy"
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
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        My orders
                        {/* <DropdownMenuShortcut>⌘B</DropdownMenuShortcut> */}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Log out
                        {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Link to="/cart" className="relative">
              <img src={assets.cart_icon} className="w-5 min-w-5" alt="cart" />
              <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getCartCount()}
              </p>
            </Link>
            <Link
              to="https://wa.me/8248586654?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it.%20Can%20you%20help%20me%20with%20sizes%20and%20pricing?"
              target="_black"
              className="shrink-0 max-md:hidden"
            >
              <img
                src={assets.whatsapp_icon_02}
                className="w-7"
                alt="whatsapp"
              />
            </Link>
            <img
              onClick={() => setVisible(true)}
              src={assets.menu_icon}
              className="w-5 cursor-pointer md:hidden"
              alt="menubar"
            />
          </div>
        </nav>
      </header>

      {/* Sidebar menu for small screens */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-white z-50 transition-transform duration-300 ease-in-out transform ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex flex-col gap-3 text-gray-800">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleCloseSidebar}
          >
            <img
              src={assets.dropdown_icon}
              alt="Close"
              className="h-4 rotate-180"
            />
            <span>Back</span>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleCloseSidebar}
              className="py-2 pl-4 border-b"
            >
              {item.name}
            </NavLink>
          ))}
          <Link
            to="https://wa.me/8248586654?text=Hey!%20I%20saw%20your%20collection%20and%20loved%20it."
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCloseSidebar}
            className="py-2 pl-4 border-b"
          >
            WHATSAPP
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
