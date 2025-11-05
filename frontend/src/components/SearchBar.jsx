import React, { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  const {
    search,
    setSearchQuery,
    showSearch,
    toggleSearch,
    loading,
    // filters,
    updateFilters,
  } = useContext(ShopContext);

  const [isVisible, setIsVisible] = useState(false);
  const inputRef = React.useRef(null);

  useEffect(() => {
    setIsVisible(location.pathname.includes("collection"));
  }, [location.pathname]);

  // Focus input when search becomes visible
  useEffect(() => {
    if (showSearch && isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch, isVisible]);

  const onSubmitSearch = async () => {
    await updateFilters({ search: search });
  };

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    toggleSearch();
    const clearedFilters = {
      category: [],
      subCategory: [],
      theme: [],
      sortBy: "newest",
      search: "",
    };
    updateFilters(clearedFilters);
  }, [setSearchQuery, toggleSearch]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClearSearch();
      }
      if (e.key === "Enter") {
        onSubmitSearch();
      }
    },
    [handleClearSearch]
  );

  // const onSubmitSearch = async () => {
  // console.log(search);
  // if (search != "") {
  //   const newQueryParams = new URLSearchParams(queryParams.toString()); // Clone existing params
  //   newQueryParams.set("search", search);
  //   navigate({
  //     pathname: location.pathname,
  //     search: newQueryParams.toString(),
  //   });
  // }
  // };

  if (!showSearch || !isVisible) return null;

  return (
    <div
      className="border-t border-b bg-gray-50 text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="inline-flex items-center justify-center border border-gray-400 pl-5 my-5 mx-3 rounded-full w-3/4 sm:w-1/2"
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
        <Button
          onClick={onSubmitSearch}
          disabled={loading}
          variant="ghost"
          className="rounded-r-full px-4 py-2 border border-l"
        >
          <img
            className="w-4"
            src={assets.search_icon}
            alt="search"
            aria-hidden="true"
          />
        </Button>
      </div>
      <button
        onClick={handleClearSearch}
        className="inline p-1 cursor-pointer"
        aria-label="Close search"
      >
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
