import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    has_placed_first_order: { type: Boolean, default: false },
    coupon: { type: String, unique: true, sparse: true, default: "" },
    isCouponActive: { type: Boolean, default: false },
    paymentScreenshot: { type: String, default: "" },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
