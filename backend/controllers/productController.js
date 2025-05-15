import productModel from "../models/productModel.js";
import { uploadToR2 } from "../config/cloudflare.js";
import { v4 as uuidv4 } from "uuid";
import { createAuditLog } from "./auditController.js";

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

    const user = req.user;

    // Process images
    const images = [
      req.files?.image1?.[0],
      req.files?.image2?.[0],
      req.files?.image3?.[0],
      // req.files?.image4?.[0],
    ].filter(Boolean);

    const imagesUrl = await Promise.all(
      images.map(async (file) => {
        const fileName = `products/${uuidv4()}-${file.originalname}`;
        return await uploadToR2(file.buffer, fileName, file.mimetype);
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      image: imagesUrl,
      tag,
      theme,
      customizable: customizable === "true",
      discount,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();

    await createAuditLog({
      action: "PRODUCT ADDED",
      userId: user.id,
      metadata: { ip: req.ip },
    });

    return res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

const editProduct = async (req, res) => {
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
      imagesToDelete,
    } = req.body;

    const user = req.user;

    // Delete old images if specified
    if (imagesToDelete && imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map(async (url) => {
          try {
            const key = url.split("/").pop();
            await deleteFromR2(key);
          } catch (error) {
            console.error(`Error deleting image ${url}:`, error);
          }
        })
      );
    }

    // Process new images
    const newImages = [
      req.files?.image1?.[0],
      req.files?.image2?.[0],
      req.files?.image3?.[0],
    ].filter(Boolean);

    const newImagesUrls = await Promise.all(
      newImages.map(async (file) => {
        const fileName = `products/${uuidv4()}-${file.originalname}`;
        return await uploadToR2(file.buffer, fileName, file.mimetype);
      })
    );

    // Get the current product to merge images
    const currentProduct = await productModel.findById(id);
    if (!currentProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    // Filter out deleted images and add new ones
    const updatedImages = currentProduct.image
      .filter((img) => !imagesToDelete?.includes(img))
      .concat(newImagesUrls);

    const updateData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      image: updatedImages,
      tag,
      theme,
      customizable: customizable === "true",
      discount,
    };

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    await createAuditLog({
      action: "PRODUCT EDITED",
      userId: user.id,
      metadata: { ip: req.ip, productId: id },
    });

    return res.json({
      success: true,
      message: "Product updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// Function for listing products with pagination
const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const custom = req.query.custom === "true";
    const admin = req.query.admin === "true";
    const skip = (page - 1) * limit;

    // For admin view - return all products without pagination
    if (admin) {
      const products = await productModel.find({}).sort({ date: -1 }); // Sort by newest first
      return res.json({ success: true, products });
    }

    // For custom products view
    if (custom) {
      const products = await productModel
        .find({ customizable: true })
        .sort({ date: -1 });
      return res.json({ success: true, products });
    }

    // For regular paginated view
    const products = await productModel
      .find({})
      .sort({ date: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    const totalProducts = await productModel.countDocuments();
    const hasMore = skip + products.length < totalProducts;

    return res.json({
      success: true,
      products,
      hasMore,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    });
  } catch (error) {
    console.error("Product listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  const user = req.user;

  try {
    await productModel.findByIdAndDelete(req.body.id);

    await createAuditLog({
      action: "PRODUCT REMOVED",
      userId: user.id,
      metadata: { ip: req.ip },
    });

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
    return res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct, editProduct };
