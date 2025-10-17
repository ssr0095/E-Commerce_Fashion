import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
// import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import SmallNavBar from "../components/SmallNavBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ListFilterPlus,
  CircleXIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Helmet } from "react-helmet-async";

const Collection = () => {
  const {
    products,
    hasMore,
    getProductsData,
    filters,
    filterOptions,
    updateFilters,
    totalPages, // From your ShopContext
    currentPage, // From your ShopContext
    loading,
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    category: [],
    subCategory: [],
    theme: [],
    sortBy: "newest",
  });

  // Initialize pending filters when component mounts
  useEffect(() => {
    setPendingFilters(filters);
  }, []);

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
    let SortBy = "newest";
    switch (sortType) {
      case "low-high":
        SortBy = "price-low";
        break;
      case "high-low":
        SortBy = "price-high";
        break;
      default:
        SortBy = "newest";
    }
    setPendingFilters((prev) => ({ ...prev, sortBy: SortBy }));
  };

  // Apply filters when submit button is clicked
  const applyFilters = async () => {
    await updateFilters(pendingFilters);
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
  };

  // New pagination handler
  const handlePageChange = async (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage)
      return;

    await getProductsData(pageNumber, true, filters);

    // Scroll to top of products grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      if (currentPage >= maxVisiblePages) {
        items.push(
          <PaginationItem key={1}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(1);
              }}
              className="cursor-pointer"
            >
              <ChevronsLeft />
            </PaginationLink>
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key="prev">
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      );
    }

    // First page + ellipsis if needed
    // if (startPage > 1) {
    //   items.push(
    //     <PaginationItem key={1}>
    //       <PaginationLink
    //         href="#"
    //         onClick={(e) => {
    //           e.preventDefault();
    //           handlePageChange(1);
    //         }}
    //         className="cursor-pointer"
    //       >
    //         1
    //       </PaginationLink>
    //     </PaginationItem>
    //   );

    // if (startPage > 2) {
    //   items.push(
    //     <PaginationItem key="ellipsis-start">
    //       <PaginationEllipsis />
    //     </PaginationItem>
    //   );
    // }
    // }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={currentPage === i}
            className="cursor-pointer max-sm:w-10"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page + ellipsis if needed
    // if (endPage < totalPages) {
    // if (endPage < totalPages - 1) {
    //   items.push(
    //     <PaginationItem key="ellipsis-end">
    //       <PaginationEllipsis />
    //     </PaginationItem>
    //   );
    // }

    // items.push(
    //   <PaginationItem key={totalPages}>
    //     <PaginationLink
    //       href="#"
    //       onClick={(e) => {
    //         e.preventDefault();
    //         handlePageChange(totalPages);
    //       }}
    //       className="cursor-pointer"
    //     >
    //       {totalPages}
    //     </PaginationLink>
    //   </PaginationItem>
    // );
    // }

    // Next button
    if (currentPage < totalPages) {
      items.push(
        <PaginationItem key="next">
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      );

      if (currentPage <= totalPages - maxVisiblePages) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
              className="cursor-pointer"
            >
              <ChevronsRight />
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  // Get active filter count for UI
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
        {/*Filter Section*/}
        <div className="min-w-60 px-4 mb-4">
          <div className="my-2 text-xl flex items-center justify-between max-sm:cursor-pointer">
            <div
              className="flex items-center gap-2"
              onClick={() => setShowFilter(!showFilter)}
            >
              FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}
              <ListFilterPlus className="w-6 p-1 rounded-sm max-sm:bg-gray-100" />
            </div>
            {activeFilterCount > 0 && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="rounded-full md:hidden"
              >
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

          {/* Sort Filter */}
          <div
            className={`border border-gray-300 px-4 pl-5 py-3 my-5 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">SORT BY</p>
            {/* <div className=""> */}
            <Select onValueChange={handleSortChange} defaultValue={"newest"}>
              <SelectTrigger className="min-w-32 ">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="low-high">Low to High</SelectItem>
                <SelectItem value="high-low">High to Low</SelectItem>
              </SelectContent>
            </Select>
            {/* </div> */}
          </div>

          {/* Apply Filters Button */}
          {hasPendingChanges && (
            <Button
              onClick={applyFilters}
              className="w-full rounded-none"
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

          <Separator className="sm:hidden my-3" />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className=" text-2xl mb-3">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Products List */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 gap-y-4">
            {products.length > 0 ? (
              products.map((item, index) => (
                <ProductItem
                  key={`${item._id}_${index}`}
                  name={item.name}
                  id={item._id}
                  slug={item.slug}
                  price={item.price}
                  image={item.image}
                  tag={item.tag}
                  description={item.description}
                  discount={item.discount}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                {loading ? "Loading products..." : "No products found."}
              </div>
            )}
          </div>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-20">
              <Pagination>
                <PaginationContent>{renderPaginationItems()}</PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
