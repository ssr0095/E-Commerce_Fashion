import React, { useState } from "react";
import { assets } from "../assets/assets";
import Loader from "../components/CompLoader";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Add = ({ token }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("10");
  const [tag, setTag] = useState("");
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [customizable, setCustomizable] = useState(false);
  const [sizes, setSizes] = useState([]);
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  const maxSize = 3 * 1024 * 1024; // 3MB

  const validateFile = (file, input) => {
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, AVIF, or WEBP images are allowed.");
      input.value = "";
      return false;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 3MB.");
      input.value = "";
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("tag", tag);
      formData.append("theme", theme);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("customizable", customizable);
      sizes.forEach((size) => formData.append("sizes", size));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      setIsLoading(true);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      setIsLoading(false);

      if (response.data.success) {
        toast.success(response.data.message);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setName("");
        setDescription("");
        setPrice("");
        setDiscount(10);
        setBestseller(false);
        setCustomizable(false);
        setTag("");
        setTheme("");
        setCategory("");
        setSubCategory("");
        setSizes([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="relative flex flex-col w-full items-start gap-3 max-sm:px-6"
    >
      {isLoading && <Loader />}
      {/* IMAGES */}
      <div>
        <p className="mb-2 font-medium">Upload Image</p>

        <div className="w-full flex items-start gap-4 flex-wrap">
          {[image1, image2, image3, image4].map((image, index) => {
            const imageId = `image${index + 1}`;
            return (
              <Label
                key={imageId}
                htmlFor={imageId}
                className="w-[80px] aspect-[3/4] cursor-pointer rounded border border-gray-300 overflow-hidden"
              >
                <img
                  src={!image ? assets.upload_area : URL.createObjectURL(image)}
                  alt={`upload${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <input
                  type="file"
                  id={imageId}
                  hidden
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required={index === 0}
                  onChange={(e) => {
                    const fileInput = e.target;
                    const file = fileInput.files?.[0];
                    if (!file) return;

                    if (!validateFile(file, fileInput)) return;

                    switch (index) {
                      case 0:
                        setImage1(file);
                        break;
                      case 1:
                        setImage2(file);
                        break;
                      case 2:
                        setImage3(file);
                        break;
                      case 3:
                        setImage4(file);
                        break;
                    }
                  }}
                />
              </Label>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <Input
          onChange={(e) => {
            setName(e.target.value);
          }}
          value={name}
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product description</p>
        <Textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          type="text"
          placeholder="Write content here"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-2 w-full">
        <div>
          <p className="mb-2">Product theme</p>
          <Select
            value={theme}
            onValueChange={(value) => setTheme(value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectGroup> */}
              {/* <SelectLabel>Theme</SelectLabel> */}
              <SelectItem value="aesthetic">Aesthetic</SelectItem>
              <SelectItem value="streetwear">Streetwear</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
              <SelectItem value="minimalist">Illustrate</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="graphic">Graphic Art</SelectItem>
              <SelectItem value="bold">Bold & Edgy</SelectItem>
              <SelectItem value="pastel">Pastel Vibes</SelectItem>
              <SelectItem value="typography">Typography</SelectItem>
              <SelectItem value="quirky">Quirky & Fun</SelectItem>
              <SelectItem value="others">Others</SelectItem>
              {/* </SelectGroup> */}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Product category</p>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Unisex">Unisex</SelectItem>
              <SelectItem value="Kids">Kids</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <Select
            value={subCategory}
            onValueChange={(value) => setSubCategory(value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T-Shirts">T-Shirts</SelectItem>
              <SelectItem value="Hoodies">Hoodies</SelectItem>
              <SelectItem value="Shirts">Shirts</SelectItem>
              <SelectItem value="Jackets">Jackets</SelectItem>
              <SelectItem value="Joggers">Joggers</SelectItem>
              <SelectItem value="Shorts">Shorts</SelectItem>
              <SelectItem value="Co-ords">Co-ords</SelectItem>
              <SelectItem value="Oversized">Oversized</SelectItem>
              <SelectItem value="Sweatshirts">Sweatshirts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Tag</p>
          <Select
            value={tag}
            onValueChange={(value) => setTag(value)}
            className="w-full px-3 py-2"
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New Arrival">New Arrival</SelectItem>
              <SelectItem value="Limited Edition">Limited Edition</SelectItem>
              <SelectItem value="Trending">Trending</SelectItem>
              <SelectItem value="Best Seller">Best Seller</SelectItem>
              <SelectItem value="Express Shipping">Express Shipping</SelectItem>
              <SelectItem value="Back in Stock">Back in Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <Input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="₹250"
            required
          />
        </div>
        <div>
          <p className="mb-2">Product Discount</p>
          <Input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="10%"
            required
          />
        </div>
      </div>

      {/* SIZES */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3 overflow-scroll">
          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("XXS")
                  ? prev.filter((item) => item !== "XXS")
                  : [...prev, "XXS"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("XXS") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              XXS
            </p>
          </div>
          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("XS")
                  ? prev.filter((item) => item !== "XS")
                  : [...prev, "XS"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("XS") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              XS
            </p>
          </div>
          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("S")
                  ? prev.filter((item) => item !== "S")
                  : [...prev, "S"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("S") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              S
            </p>
          </div>

          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("M")
                  ? prev.filter((item) => item !== "M")
                  : [...prev, "M"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("M") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              M
            </p>
          </div>

          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("L")
                  ? prev.filter((item) => item !== "L")
                  : [...prev, "L"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("L") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              L
            </p>
          </div>

          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("XL")
                  ? prev.filter((item) => item !== "XL")
                  : [...prev, "XL"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("XL") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              XL
            </p>
          </div>

          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("XXL")
                  ? prev.filter((item) => item !== "XXL")
                  : [...prev, "XXL"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("XXL") ? "bg-green-200" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              XXL
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="size-4"
        />
        <Label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </Label>
      </div>

      <div className="flex items-center gap-2 mt-2 mb-2">
        <Input
          onChange={() => setCustomizable((prev) => !prev)}
          checked={customizable}
          type="checkbox"
          id="customizable"
          className="size-4"
        />
        <Label className="cursor-pointer" htmlFor="customizable">
          Add to Customizable
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-[40%] self-end mt-4 rounded-none"
      >
        Save
      </Button>
    </form>
  );
};

export default Add;
