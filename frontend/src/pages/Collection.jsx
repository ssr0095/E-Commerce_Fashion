import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
// import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SmallNavBar from "../components/SmallNavBar";
import { Button } from "@/components/ui/button";
import { ListFilterPlus, CircleXIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

const Collection = () => {
  const {
    products,
    hasMore,
    getProductsData,
    filters,
    filterOptions,
    updateFilters,
  } = useContext(ShopContext);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    category: [],
    subCategory: [],
    theme: [],
    sortBy: "newest",
  });

  // Initialize pending filters when component mounts or filters change
  useEffect(() => {
    setPendingFilters(filters);
  }, []);

  // Filter selection handlers
  const handleCategoryToggle = (category) => {
    const newCategories = pendingFilters.category.includes(category)
      ? pendingFilters.category.filter((item) => item !== category)
      : [...pendingFilters.category, category];

    setPendingFilters((prev) => ({ ...prev, category: newCategories }));
  };

  const handleSubCategoryToggle = (subCategory) => {
    const newSubCategories = pendingFilters.subCategory.includes(subCategory)
      ? pendingFilters.subCategory.filter((item) => item !== subCategory)
      : [...pendingFilters.subCategory, subCategory];

    setPendingFilters((prev) => ({ ...prev, subCategory: newSubCategories }));
  };

  const handleThemeToggle = (theme) => {
    const newThemes = pendingFilters.theme.includes(theme)
      ? pendingFilters.theme.filter((item) => item !== theme)
      : [...pendingFilters.theme, theme];

    setPendingFilters((prev) => ({ ...prev, theme: newThemes }));
  };

  const handleSortChange = (sortType) => {
    let sortBy = "newest";
    switch (sortType) {
      case "low-high":
        sortBy = "price-low";
        break;
      case "high-low":
        sortBy = "price-high";
        break;
      default:
        sortBy = "newest";
    }
    setPendingFilters((prev) => ({ ...prev, sortBy }));
  };

  // Apply filters when submit button is clicked
  const applyFilters = async () => {
    setLoading(true);
    setPage(1);
    await updateFilters(pendingFilters);
    await getProductsData(1, true, pendingFilters);
    setLoading(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: [],
      subCategory: [],
      theme: [],
      sortBy: "newest",
    };
    setPendingFilters(clearedFilters);
    updateFilters(clearedFilters);
    getProductsData(1, true, clearedFilters);
    setPage(1);
  };

  const handleSeeMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    await getProductsData(nextPage, false, filters);
    setPage(nextPage);
    setLoading(false);
  };

  // Get active filter count for UI (from pending filters)
  const activeFilterCount = [
    ...pendingFilters.category,
    ...pendingFilters.subCategory,
    ...pendingFilters.theme,
  ].length;

  // Check if there are pending changes
  const hasPendingChanges =
    JSON.stringify(pendingFilters.category) !==
      JSON.stringify(filters.category) ||
    JSON.stringify(pendingFilters.subCategory) !==
      JSON.stringify(filters.subCategory) ||
    JSON.stringify(pendingFilters.theme) !== JSON.stringify(filters.theme) ||
    pendingFilters.sortBy !== filters.sortBy;

  return (
    <div className="px-2 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Helmet>
        {/* Basic */}
        <title>Collections — Cousins Fashion</title>
        <meta
          name="title"
          content="Shop All Collections | Streetwear, Oversized & Vintage T-Shirts"
        />
        <meta
          name="description"
          content="Explore curated collections at Cousins Fashion. From aesthetic streetwear to bold unisex styles, find minimalist and oversized fits that stand out."
        />
        <link rel="canonical" href={"https://cousinsfashion.in/collection"} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Collections — Cousins Fashion" />
        <meta
          property="og:description"
          content="Explore curated collections at Cousins Fashion. From aesthetic streetwear to bold unisex styles, find minimalist and oversized fits that stand out."
        />
        <meta
          property="og:url"
          content={"https://cousinsfashion.in/collection"}
        />
        <meta property="og:image" content={products[0]?.image[0]} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="px-2">
        <SmallNavBar navs={["Collection"]} />
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
        <div className="min-w-60 px-4">
          <div className="my-2 text-xl flex items-center justify-between max-sm:cursor-pointer">
            <div
              className="flex items-center gap-2"
              onClick={() => setShowFilter(!showFilter)}
            >
              FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}
              <ListFilterPlus className="w-6 p-1 rounded-sm max-sm:bg-gray-100" />
            </div>
            {activeFilterCount > 0 && (
              <Button onClick={clearFilters} className="rounded-full md:hidden">
                <CircleXIcon />
                Clear
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">CATEGORY</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {filterOptions.categories.map((cat) => (
                <label className="flex gap-2" key={cat}>
                  <input
                    type="checkbox"
                    checked={pendingFilters.category.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* SubCategory Filter */}
          {filterOptions.subCategories.length > 0 && (
            <div
              className={`border border-gray-300 px-4 pl-5 py-3 my-5 ${
                showFilter ? "" : "hidden"
              } sm:block`}
            >
              <p className="mb-3 text-sm font-medium">TYPE</p>
              <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                {filterOptions.subCategories.map((type) => (
                  <label className="flex gap-2" key={type}>
                    <input
                      type="checkbox"
                      checked={pendingFilters.subCategory.includes(type)}
                      onChange={() => handleSubCategoryToggle(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Theme Filter */}
          {filterOptions.themes.length > 0 && (
            <div
              className={`border border-gray-300 px-4 pl-5 py-3 my-5 ${
                showFilter ? "" : "hidden"
              } sm:block`}
            >
              <p className="mb-3 text-sm font-medium">THEME</p>
              <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
                {filterOptions.themes.map((themeItem) => (
                  <label className="flex gap-2" key={themeItem}>
                    <input
                      type="checkbox"
                      checked={pendingFilters.theme.includes(themeItem)}
                      onChange={() => handleThemeToggle(themeItem)}
                    />
                    {themeItem.charAt(0).toUpperCase() + themeItem.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Apply Filters Button */}
          {hasPendingChanges && (
            <Button
              onClick={applyFilters}
              className="w-full rounded-none mt-4"
              disabled={loading}
            >
              {loading ? "Applying..." : "Apply Filters"}
            </Button>
          )}

          {activeFilterCount > 0 && (
            <Button
              onClick={clearFilters}
              className="w-full rounded-none mt-2 max-md:hidden"
              variant="outline"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center text-base sm:text-2xl mb-4">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
            <Select
              onValueChange={handleSortChange}
              value={pendingFilters.sortBy}
            >
              <SelectTrigger className="min-w-32 max-w-[40%] lg:max-w-[30%]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="price-low">Sort by: Low to High</SelectItem>
                <SelectItem value="price-high">Sort by: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 gap-y-4">
            {products.length > 0 ? (
              products.map((item, index) => (
                <ProductItem
                  key={`${item._id}_${index}`}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.image}
                  tag={item.tag}
                  description={item.description}
                  discount={item.discount}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No products found.
              </div>
            )}
          </div>

          {hasMore && (
            <div className="w-full flex items-center justify-center mt-14 px-4 relative">
              <div className="w-full flex items-center justify-center z-10">
                <Button
                  onClick={handleSeeMore}
                  variant="outline"
                  className="rounded-none"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "See more"}
                </Button>
              </div>
              <hr className="absolute top-[50%] left-0 w-full z-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
