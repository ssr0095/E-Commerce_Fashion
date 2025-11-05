import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
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
import Loader from "../components/CompLoader";
import { assets } from "../assets/assets";
import { backendUrl, currency } from "../App";
import { X } from "lucide-react";

const Edit = ({ token, productId, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalImages, setOriginalImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/product/single-by-id`,
          {
            productId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.success) {
          const product = response.data.product;
          setOriginalImages(product.image);
          setName(product.name);
          setDescription(product.description);
          setPrice(`${product.price}`);
          setDiscount(`${product.discount}`);
          setTag(product.tag);
          setTheme(product.theme);
          setCategory(product.category);
          setSubCategory(product.subCategory);
          setBestseller(product.bestseller);
          setCustomizable(product.customizable);
          setSizes(product.sizes);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.message);
        if (error.status == 401) {
          setToken("");
          localStorage.removeItem("token");
          window.location.reload();
        }
      } finally {
        setFetching(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

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

  const handleImageChange = (e, index) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!validateFile(file, fileInput)) return;

    // Mark original image for deletion if it exists
    if (originalImages[index]) {
      setImagesToDelete((prev) => [...prev, originalImages[index]]);
    }

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
    }
  };

  const removeImage = (index) => {
    // Mark original image for deletion if it exists
    if (originalImages[index]) {
      setImagesToDelete((prev) => [...prev, originalImages[index]]);
    }

    // Clear the image state
    switch (index) {
      case 0:
        setImage1(null);
        break;
      case 1:
        setImage2(null);
        break;
      case 2:
        setImage3(null);
        break;
    }

    // Clear the file input
    const input = document.getElementById(`image${index + 1}`);
    if (input) input.value = "";
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

    try {
      const formData = new FormData();

      formData.append("id", productId);
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

      // Append images to delete
      imagesToDelete.forEach((url) => formData.append("imagesToDelete", url));

      // Append new images
      if (image1) formData.append("image1", await compressImage(image1));
      if (image2) formData.append("image2", await compressImage(image2));
      if (image3) formData.append("image3", await compressImage(image3));

      const response = await axios.post(
        `${backendUrl}/api/product/edit`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onUpdate(); // Refresh the product list
        onClose(); // Close the dialog
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
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

  if (fetching) return <Loader />;

  return (
    <form
      onSubmit={onSubmitHandler}
      className="absolute flex flex-col w-full items-start gap-3 p-4 pt-16"
    >
      {isLoading && <Loader />}

      {/* IMAGES */}
      <div>
        <p className="mb-2 font-medium">Product Images</p>
        <div className="flex items-start gap-4">
          {[0, 1, 2].map((index) => {
            const imageId = `image${index + 1}`;
            const currentImage = [image1, image2, image3][index];
            const originalImage = originalImages[index];

            return (
              <div
                key={imageId}
                className="relative group w-[80px] aspect-[3/4] cursor-pointer rounded border border-gray-300 overflow-hidden"
              >
                <Label htmlFor={imageId} className="">
                  <img
                    src={
                      currentImage
                        ? URL.createObjectURL(currentImage)
                        : originalImage || assets.upload_area
                    }
                    width={300}
                    height={400}
                    alt={`product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <input
                    type="file"
                    id={imageId}
                    name={imageId}
                    hidden
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => handleImageChange(e, index)}
                  />
                </Label>
                {(currentImage || originalImage) && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-gray-500 text-gray-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product name</p>
        <Input
          onChange={(e) => setName(e.target.value)}
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
            <SelectContent className="max-h-[150px]">
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
            <SelectContent className="max-h-[150px]">
              <SelectItem value="New Arrival">New Arrival</SelectItem>
              <SelectItem value="Limited Edition">Limited Edition</SelectItem>
              <SelectItem value="Trending">Trending</SelectItem>
              {/* <SelectItem value="Best Seller">Best Seller</SelectItem> */}
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

      <div className="flex gap-2 w-full justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-none"
        >
          Cancel
        </Button>
        <Button type="submit" className="rounded-none">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default Edit;
