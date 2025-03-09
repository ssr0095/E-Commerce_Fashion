import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      tag,
      theme,
      customizable,
      discount,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: sizes,
      image: imagesUrl,
      tag,
      theme,
      customizable: customizable === "true",
      discount,
      date: Date.now(),
    };

    // console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const editProduct = async (req, res) => {
  // return res.json({ gee: req.body });
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      tag,
      theme,
      customizable,
      discount,
      existingImages, // This should be an array of current image URLs
    } = req.body;

    // console.log(req.body + "jjjjjjjj");
    // console.log(req.body);

    // Ensure existingImages is an array
    // const currentImages = existingImages ? JSON.parse(existingImages) : [];

    // // Get uploaded files
    // const image1 = req.files?.image1?.[0];
    // const image2 = req.files?.image2?.[0];
    // const image3 = req.files?.image3?.[0];
    // const image4 = req.files?.image4?.[0];

    // const newImages = [image1, image2, image3, image4].filter(Boolean);

    // console.log("New Images Received:", name);
    // console.log("New Images Received:", newImages);
    // console.log("Existing Images:", currentImages);

    // // Upload new images to Cloudinary
    // let uploadedImages = await Promise.all(
    //   newImages.map(async (item) => {
    //     let result = await cloudinary.uploader.upload(item.path, {
    //       resource_type: "image",
    //     });
    //     return result.secure_url;
    //   })
    // );

    // Combine existing images with newly uploaded ones
    // const finalImages = [...currentImages, ...uploadedImages];

    // Create updated product data
    const productData = {
      name: name,
      description: description,
      category: category,
      price: Number(price),
      subCategory: subCategory,
      bestseller: bestseller === "true",
      sizes: sizes,
      image: existingImages,
      tag: tag,
      theme: theme,
      discount,
      customizable: customizable === "true",
      date: Date.now(),
    };

    console.log("Updated Product Data:", productData);

    // Ensure product exists before updating
    const product = await productModel.findById(id);
    console.log(product);
    // if (!product) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Product not found" });
    // }

    await productModel.findByIdAndUpdate(id, productData);

    res.json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.error("Error in editProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function for listing products with pagination
const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const custom = req.query.custom == "true";
    const admin = req.query.admin == "true";
    const skip = (page - 1) * limit;
    // console.log(req.query.custom);
    if (admin) {
      const products = await productModel.find({});
      return res.json({ success: true, products });
    }
    if (custom) {
      const products = await productModel.find({ customizable: true });
      res.json({ success: true, products });
    } else {
      const products = await productModel.find({}).skip(skip).limit(limit);
      const totalProducts = await productModel.countDocuments();
      const hasMore = skip + products.length < totalProducts;
      res.json({ success: true, products, hasMore });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct, editProduct };
