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

productSchema.index({ date: -1 }); // For faster sorting
productSchema.index({ customizable: 1 }); // For custom product queries
productSchema.index({ category: 1, date: -1 });
productSchema.index({ subCategory: 1, date: -1 });
productSchema.index({ theme: 1, date: -1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", theme: "text" }); // For search

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
