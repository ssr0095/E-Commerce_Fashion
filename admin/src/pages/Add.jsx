import { useState } from "react";
import { assets } from "../assets/assets";
import Loader from "../components/CompLoader";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Add = ({ token, setToken }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  // const [image4, setImage4] = useState(false);

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

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Compress to ≤1MB
      maxWidthOrHeight: 1920, // Resize if needed
    };
    return await imageCompression(file, options);
  };

  const resetForm = () => {
    // Clear file inputs
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      input.value = "";

      setImage1(false);
      setImage2(false);
      setImage3(false);
      // setImage4(false);
      setName("");
      setDescription("");
      setPrice("");
      setDiscount("10");
      setBestseller(false);
      setCustomizable(false);
      setTag("");
      setTheme("");
      setCategory("");
      setSubCategory("");
      setSizes([]);
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) return toast.error("Name not provided");
    if (!description.trim()) return toast.error("Description not provided");
    if (!price.trim()) return toast.error("Price not provided");
    if (!discount.trim()) return toast.error("Discount not provided");
    if (!theme.trim()) return toast.error("Theme not provided");
    if (!category.trim()) return toast.error("Category not provided");
    if (!subCategory.trim()) return toast.error("SubCategory not provided");
    if (!sizes) return toast.error("Sizes not provided");
    if (!image1) return toast.error("Upload atleast 1 image");

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

      if (image1) formData.append("image1", await compressImage(image1));
      if (image2) formData.append("image2", await compressImage(image2));
      if (image3) formData.append("image3", await compressImage(image3));
      // if (image4) formData.append("image4", await compressImage(image4));

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();

        // window.location.reload()
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message);
      if (error.status == 401) {
        setToken("");
        localStorage.removeItem("token");
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
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
        <p className="mb-2 font-medium">Product Images</p>
        <div className="w-full flex items-start gap-4 flex-wrap">
          {/* {[image1, image2, image3, image4].map((image, index) => { */}
          {[image1, image2, image3].map((image, index) => {
            const imageId = `image${index + 1}`;
            return (
              <Label
                key={imageId}
                htmlFor={imageId}
                className="w-[80px] aspect-[3/4] cursor-pointer rounded border border-gray-300 overflow-hidden"
              >
                <img
                  src={!image ? assets.upload_area : URL.createObjectURL(image)}
                  alt={`upload image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <input
                  type="file"
                  id={imageId}
                  name={imageId}
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
                      // case 3:
                      //   setImage4(file);
                      // break;
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
            <SelectContent className="max-h-[150px]">
              {/* <SelectGroup> */}
              {/* <SelectLabel>Theme</SelectLabel> */}
              {/* <ScrollArea className="max-h-[150px]"> */}
              <SelectItem value="aesthetic">Aesthetic</SelectItem>
              <SelectItem value="streetwear">Streetwear</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
              <SelectItem value="illustrate">Illustrate</SelectItem>
              <SelectItem value="vintage">Vintage</SelectItem>
              <SelectItem value="graphic">Graphic Art</SelectItem>
              <SelectItem value="bold">Bold & Edgy</SelectItem>
              <SelectItem value="pastel">Pastel Vibes</SelectItem>
              <SelectItem value="typography">Typography</SelectItem>
              <SelectItem value="quirky">Quirky & Fun</SelectItem>
              <SelectItem value="others">Others</SelectItem>
              {/* </SelectGroup> */}
              {/* </ScrollArea> */}
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
            <SelectContent className="max-h-[150px]">
              {/* <ScrollArea className="max-h-[150px]"> */}
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Unisex">Unisex</SelectItem>
              <SelectItem value="Kids">Kids</SelectItem>
              {/* </ScrollArea> */}
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
            <SelectContent className="max-h-[150px]">
              {/* <ScrollArea className="max-h-[150px]"> */}
              <SelectItem value="T-Shirts">T-Shirts</SelectItem>
              <SelectItem value="Hoodies">Hoodies</SelectItem>
              <SelectItem value="Shirts">Shirts</SelectItem>
              <SelectItem value="Jackets">Jackets</SelectItem>
              <SelectItem value="Joggers">Joggers</SelectItem>
              <SelectItem value="Shorts">Shorts</SelectItem>
              <SelectItem value="Co-ords">Co-ords</SelectItem>
              <SelectItem value="Oversized">Oversized</SelectItem>
              <SelectItem value="Sweatshirts">Sweatshirts</SelectItem>
              {/* </ScrollArea> */}
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
            <SelectContent className="max-h-[150px]">
              {/* <ScrollArea className="max-h-[150px]"> */}
              <SelectItem value="New Arrival">New Arrival</SelectItem>
              <SelectItem value="Limited Edition">Limited Edition</SelectItem>
              <SelectItem value="Trending">Trending</SelectItem>
              {/* <SelectItem value="Best Seller">Best Seller</SelectItem> */}
              <SelectItem value="Express Shipping">Express Shipping</SelectItem>
              <SelectItem value="Back in Stock">Back in Stock</SelectItem>
              {/* </ScrollArea> */}
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
        <ScrollArea>
          <div className="flex gap-3">
            {["XXS", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(size)
                      ? prev.filter((item) => item !== size)
                      : [...prev, size]
                  )
                }
              >
                <p
                  className={`${
                    sizes.includes(size) ? "bg-green-200" : "bg-slate-200"
                  } px-3 py-1 cursor-pointer`}
                >
                  {size}
                </p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
