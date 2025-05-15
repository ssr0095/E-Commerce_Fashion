import React, { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearchQuery, showSearch, toggleSearch, loading } =
    useContext(ShopContext);

  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const inputRef = React.useRef(null);

  // Determine visibility based on route
  useEffect(() => {
    setIsVisible(location.pathname.includes("collection"));
  }, [location.pathname]);

  // Focus input when search becomes visible
  useEffect(() => {
    if (showSearch && isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch, isVisible]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    toggleSearch();
  }, [setSearchQuery, toggleSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClearSearch();
      }
    },
    [handleClearSearch]
  );

  if (!showSearch || !isVisible) return null;

  return (
    <div
      className="border-t border-b bg-gray-50 text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2"
        role="search"
      >
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 outline-none bg-inherit text-sm"
          type="text"
          placeholder={loading ? "Loading products..." : "Search products..."}
          aria-label="Search products"
          disabled={loading}
        />
        <img
          className="w-4"
          src={assets.search_icon}
          alt="search"
          aria-hidden="true"
        />
      </div>
      <button
        onClick={handleClearSearch}
        className="inline p-1 cursor-pointer"
        aria-label="Close search"
      >
        {/* <X className="w-6 text-gray-500" /> */}
        <img
          className="w-3"
          src={assets.cross_icon}
          alt="clear"
          aria-hidden="true"
          loading="lazy"
        />
      </button>
    </div>
  );
};

export default React.memo(SearchBar);
