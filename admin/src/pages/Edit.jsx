import { useEffect, useState } from "react";
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

import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Edit = ({ token, id, setEditDialogOpen }) => {
  const [product, setProduct] = useState([]);
  const [productId, setProductId] = useState(id);

  // console.log(id, product);
  // console.log("lllllllll");
  const [newImages, setNewImages] = useState(["", "", "", ""]);
  const [oldImages, setOldImages] = useState(["", "", "", ""]);

  const [name, setName] = useState("tt");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [tag, setTag] = useState("");
  const [discount, setDiscount] = useState(0);
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

      formData.append("id", id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discount", discount);
      formData.append("extratag", tag);
      formData.append("theme", theme);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("customizable", customizable);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("existingImages", JSON.stringify(product.image));

      // console.log(newImages);
      console.log("image");
      console.log(formData.get("name"));
      // if (newImages.length > 0) {
      //   newImages.forEach((file, index) => {
      //     formData.append(`image${index + 1}`, file);
      //   });
      // }
      formData.forEach((hi) => console.log(hi));

      const response = await axios.post(
        backendUrl + "/api/product/edit",
        formData,
        { headers: { token } }
      );

      // console.log(response.gee);

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setTag("");
        setDiscount(0);
        setTheme("");
        setPrice(0);
        setCategory("");
        setSubCategory("");
        setBestseller(false);
        setCustomizable(false);
        setSizes([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //   const OnchangeHandler = (e) => {
  //     e.preventDefault();
  //   };

  const fetchProduct = async () => {
    try {
      const response = await axios.post(backendUrl + "/api/product/single", {
        productId,
      });
      console.log(response.data);
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setDiscount(product.discount || "");
      setTag(product.tag || "");
      setTheme(product.theme || "");
      setCategory(product.category || "");
      setSubCategory(product.subCategory || "");
      setBestseller(product.bestseller || "");
      setCustomizable(product.customizable || "");
      setSizes(product.sizes || []);
      if (product.image) {
        product.image.forEach((image, index) => {
          setOldImages((prev) => [(prev[index] = image)]);
        });
      }
    }
  }, [product]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle className="mb-3">Edit product</DialogTitle>
        {/* <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription> */}
      </DialogHeader>
      {/* IMAGES */}
      <div>
        <p className="mb-2">Upload Image</p>

        <div className="flex gap-2">
          <Label htmlFor="image1">
            <img
              className="w-20 h-20 bg-cover"
              src={
                oldImages[0]
                  ? oldImages[0]
                  : newImages[0]
                  ? URL.createObjectURL(newImages[0])
                  : assets.upload_area
              }
              alt="upload1"
            />
            {/* {console.log(image1 + "ig" + product)} */}
            <input
              onChange={(e) =>
                setNewImages((prev) => (prev[0] = e.target.files[0]))
              }
              type="file"
              id="image1"
              hidden
            />
          </Label>
          <Label htmlFor="image2">
            <img
              className="w-20 h-20 bg-cover"
              src={
                oldImages[1]
                  ? oldImages[1]
                  : newImages[1]
                  ? URL.createObjectURL(newImages[1])
                  : assets.upload_area
              }
              alt="upload2"
            />
            {console.log(oldImages, newImages)}
            <input
              onChange={(e) =>
                setNewImages((prev) => (prev[1] = e.target.files[0]))
              }
              type="file"
              id="image2"
              hidden
            />
          </Label>
          <Label htmlFor="image3">
            <img
              className="w-20 h-20 bg-cover"
              src={
                oldImages[2]
                  ? oldImages[2]
                  : newImages[2]
                  ? URL.createObjectURL(newImages[2])
                  : assets.upload_area
              }
              alt="upload3"
            />
            <input
              onChange={(e) =>
                setNewImages((prev) => (prev[2] = e.target.files[0]))
              }
              type="file"
              id="image3"
              hidden
            />
          </Label>
          <Label htmlFor="image4">
            <img
              className="w-20 h-20 bg-cover"
              src={
                oldImages[3]
                  ? oldImages[3]
                  : newImages[3]
                  ? URL.createObjectURL(newImages[3])
                  : assets.upload_area
              }
              alt="upload4"
            />
            <input
              onChange={(e) =>
                setNewImages((prev) => [(prev[3] = e.target.files[0])])
              }
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

      <div className="flex gap-2 mt-2">
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

      <div className="flex gap-2 mt-2 mb-2">
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
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setEditDialogOpen(false)}
          className="mb-2"
        >
          Cancel
        </Button>
        <Button type="submit" onSubmit={onSubmitHandler} className="mb-2">
          Save
        </Button>
      </DialogFooter>
    </form>
  );
};

export default Edit;
