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

const listProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      custom,
      admin,
      category,
      subCategory,
      theme,
      sortBy = "newest",
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};
    let sort = {};

    // Build query based on filters
    if (category)
      query.category = { $in: Array.isArray(category) ? category : [category] };
    if (subCategory)
      query.subCategory = {
        $in: Array.isArray(subCategory) ? subCategory : [subCategory],
      };
    if (theme) query.theme = { $in: Array.isArray(theme) ? theme : [theme] };
    if (custom) query.customizable = custom === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { theme: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subCategory: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    switch (sortBy) {
      case "price-low":
        sort = { price: 1 };
        break;
      case "price-high":
        sort = { price: -1 };
        break;
      case "newest":
      default:
        sort = { date: -1 };
        break;
    }

    // For admin view
    if (admin === "true") {
      const products = await productModel.find({}).sort(sort);
      return res.json({ success: true, products });
    }

    // Get products with filters
    const products = await productModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProducts = await productModel.countDocuments(query);
    const hasMore = skip + products.length < totalProducts;

    // Get available filters for current query (for filter options)
    const availableFilters = await getAvailableFilters(query);

    return res.json({
      success: true,
      products,
      hasMore,
      totalProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / limit),
      availableFilters,
    });
  } catch (error) {
    console.error("Product listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

const getAvailableFilters = async (baseQuery = {}) => {
  const [categories, subCategories, themes] = await Promise.all([
    productModel.distinct("category", baseQuery),
    productModel.distinct("subCategory", baseQuery),
    productModel.distinct("theme", baseQuery),
  ]);

  return {
    categories: categories.filter(Boolean),
    subCategories: subCategories.filter(Boolean),
    themes: themes.filter(Boolean),
  };
};

const getFilterOptions = async (req, res) => {
  try {
    const { category, subCategory, theme, search } = req.query;
    let query = {};

    if (category)
      query.category = { $in: Array.isArray(category) ? category : [category] };
    if (subCategory)
      query.subCategory = {
        $in: Array.isArray(subCategory) ? subCategory : [subCategory],
      };
    if (theme) query.theme = { $in: Array.isArray(theme) ? theme : [theme] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { theme: { $regex: search, $options: "i" } },
      ];
    }

    const availableFilters = await getAvailableFilters(query);

    return res.json({
      success: true,
      filters: availableFilters,
    });
  } catch (error) {
    console.error("Filter options error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filter options",
    });
  }
};

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

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  editProduct,
  getFilterOptions,
};
