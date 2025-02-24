import React, { useState } from "react";
import { assets } from "../assets/assets";
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
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tag, setTag] = useState("");
  const [theme, setTheme] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [customizable, setCustomizable] = useState(false);
  const [sizes, setSizes] = useState([]);

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
      formData.append("sizes", JSON.stringify(sizes));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setName("");
        setDescription("");
        setPrice(0);
        setDiscount(0);
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
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3 max-sm:px-6"
    >
      {/* IMAGES */}
      <div>
        <p className="mb-2">Upload Image</p>

        <div className="flex items-center gap-2">
          <Label htmlFor="image1">
            <img
              className="w-18 h-20 sm:w-20 sm:h-[90px] overflow-hidden"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              width={80}
              height={160}
              alt=""
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
            />
          </Label>
          <Label htmlFor="image2">
            <img
              className="w-18 h-20 sm:w-20 sm:h-[90px] overflow-hidden"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              width={80}
              // height={100}
              alt=""
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
            />
          </Label>
          <Label htmlFor="image3">
            <img
              className="w-18 h-20 sm:w-20 sm:h-[90px] overflow-hidden"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt=""
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
            />
          </Label>
          <Label htmlFor="image4">
            <img
              className="w-18 h-20 sm:w-20 sm:h-[90px] overflow-hidden"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt=""
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
            />
          </Label>
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
            className="w-full"
            onValueChange={(value) => setTheme(value)}
            // value={theme}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectGroup> */}
              {/* <SelectLabel>Theme</SelectLabel> */}
              <SelectItem value="anime">Anime</SelectItem>
              <SelectItem value="aesthetic">Aesthetic</SelectItem>
              <SelectItem value="others">others</SelectItem>
              {/* </SelectGroup> */}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Product category</p>
          <Select
            onValueChange={(value) => setCategory(value)}
            // value={category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Kids">Kids</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Sub category</p>
          <Select
            onValueChange={(value) => setSubCategory(value)}
            // value={subCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Topwear">Topwear</SelectItem>
              <SelectItem value="Bottomwear">Bottomwear</SelectItem>
              <SelectItem value="Winterwear">Winterwear</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="mb-2">Tag</p>
          <Select
            onValueChange={(value) => setTag(value)}
            className="w-full px-3 py-2"
            // value={tag}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Limited offer">Limited offer</SelectItem>
              <SelectItem value="Express shipping">Express shipping</SelectItem>
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
            placeholder="25"
          />
        </div>
        <div>
          <p className="mb-2">Product Discount</p>
          <Input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="20"
          />
        </div>
      </div>

      {/* SIZES */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
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
