import mongoose from "mongoose";
import slugify from "slugify"; // Install: npm install slugify

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // Add slug field
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

// Add slug generation before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: "en",
    });

    // Make slug unique by appending random string if needed
    // this.slug = `${this.slug}-${Math.random().toString(36).substring(2, 7)}`;
  }
  next();
});

// Add index for slug
// productSchema.index({ slug: 1 });
productSchema.index({ date: -1 });
productSchema.index({ customizable: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ category: 1, date: -1 });
productSchema.index({ subCategory: 1, date: -1 });
productSchema.index({ theme: 1, date: -1 });
productSchema.index({ price: 1 });
productSchema.index({ name: "text", theme: "text" });

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
