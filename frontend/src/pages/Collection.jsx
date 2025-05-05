import React, { useContext, useEffect, useState } from "react";
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

const Collection = () => {
  const { products, search, showSearch, hasMore, getProductsData } =
    useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (e) => {
    const { value } = e.target;
    setCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const { value } = e.target;
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSortType("relavent");
  };

  const applyFilter = () => {
    let productsCopy = [...products];

    if (showSearch && search) {
      const query = search.toLowerCase().trim();
      const regex = new RegExp(`\\b${query}\\b`, "i"); // word boundary match, case-insensitive

      productsCopy = productsCopy.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          regex.test(item.theme?.toLowerCase()) ||
          item.theme?.toLowerCase().startsWith(query) ||
          regex.test(item.category?.toLowerCase()) ||
          item.category?.toLowerCase().startsWith(query) ||
          regex.test(item.subCategory?.toLowerCase()) ||
          item.subCategory?.toLowerCase().startsWith(query)
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = [...filterProducts];

    if (sortType === "low-high") {
      fpCopy.sort((a, b) => a.price - b.price);
    } else if (sortType === "high-low") {
      fpCopy.sort((a, b) => b.price - a.price);
    } else {
      applyFilter();
      return;
    }

    setFilterProducts(fpCopy);
  };

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  const handleSeeMore = async () => {
    setLoading(true);
    await getProductsData(page);
    setPage((prev) => prev + 1);
    setSortType("relavent");
    setLoading(false);
  };

  return (
    <div className="px-2 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <div className="px-2">
        <SmallNavBar navs={["Collection"]} />
      </div>
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
        <div className="min-w-60 px-4">
          <div className="my-2 text-xl flex items-center justify-between max-sm:cursor-pointer">
            <div
              className=" flex items-center gap-2"
              onClick={() => setShowFilter(!showFilter)}
            >
              FILTERS
              <ListFilterPlus className="w-6 p-1 rounded-sm max-sm:bg-gray-100" />
            </div>
            <div>
              <Button
                onClick={clearFilters}
                className="w-full rounded-full md:hidden"
              >
                <CircleXIcon />
                Clear
              </Button>
            </div>
          </div>
          <div
            className={`border border-gray-300 pl-5 py-3 mt-6 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Men", "Women", "Kids"].map((cat) => (
                <label className="flex gap-2" key={cat}>
                  <input
                    className="w-3"
                    type="checkbox"
                    value={cat}
                    checked={category.includes(cat)}
                    onChange={toggleCategory}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div
            className={`border border-gray-300 px-4 pl-5 py-3 my-5 ${
              showFilter ? "" : "hidden"
            } sm:block`}
          >
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              {["Topwear", "Bottomwear", "Winterwear"].map((type) => (
                <label className="flex gap-2" key={type}>
                  <input
                    className="w-3"
                    type="checkbox"
                    value={type}
                    checked={subCategory.includes(type)}
                    onChange={toggleSubCategory}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={clearFilters}
            className="w-full rounded-none mt-4 max-md:hidden"
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center text-base sm:text-2xl mb-4">
            <Title text1={"ALL"} text2={"COLLECTIONS"} />
            <Select onValueChange={setSortType}>
              <SelectTrigger className="min-w-32 max-w-[40%] lg:max-w-[30%]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relavent">Sort by: Relavent</SelectItem>
                <SelectItem value="low-high">Sort by: Low to High</SelectItem>
                <SelectItem value="high-low">Sort by: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* -----------Products---------- */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 gap-y-4">
              {filterProducts.length > 0 ? (
                filterProducts.map((item, index) => (
                  <ProductItem
                    key={index}
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
    </div>
  );
};

export default Collection;
