import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const NavigationBar = () => {
  const { setSearchQuery, toggleSearch, navigate } = useContext(ShopContext);

  const NavItems = [
    "Men",
    "Women",
    "Streetwear",
    "Aesthetic",
    "Illustrate",
    "Typography",
    "Vintage",
    "Minimalist",
    "Others",
  ];

  const toMove = (val) => {
    setSearchQuery(val);
    toggleSearch(true); // Force open the search bar
    navigate("/collection");
  };

  return (
    <div className="flex w-full flex-1 px-6 py-2 text-sm text-gray-600 items-center justify-evenly border-t border-gray-200 max-lg:hidden">
      {NavItems.map((item) => (
        <p
          className="cursor-default hover:underline hover:underline-offset-1"
          onClick={() => toMove(item)}
          key={item}
        >
          {item}
        </p>
      ))}
    </div>
  );
};

export default NavigationBar;