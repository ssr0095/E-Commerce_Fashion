import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  tag: { type: String, required: true },
  theme: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean },
  customizable: { type: Boolean },
  discount: { type: Number, default: 10 },
  date: { type: Number, required: true },
});

// In your product model schema
productSchema.index({ date: -1 }); // For faster sorting
productSchema.index({ customizable: 1 }); // For custom product queries

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
