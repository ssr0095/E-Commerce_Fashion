import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const NavigationBar = () => {
  const { setSearch, setShowSearch, navigate } = useContext(ShopContext);

  const toMove = (val) => {
    setShowSearch(true);
    setSearch(val);
    navigate("/collection");
  };
  return (
    <div className="flex w-full flex-1 px-6 py-2 text-sm text-gray-600 items-center justify-evenly border-t border-gray-200 max-lg:hidden">
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("Men")}
      >
        Men
      </p>
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("Women")}
      >
        Women
      </p>
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("Anime")}
      >
        Anime
      </p>
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("Aesthetic")}
      >
        Aesthetic
      </p>
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("Street wear")}
      >
        Street wear
      </p>
      <p
        className="cursor-default hover:underline hover:underline-offset-1"
        onClick={() => toMove("others")}
      >
        Others
      </p>
    </div>
  );
};

export default NavigationBar;
