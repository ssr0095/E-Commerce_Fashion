import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const roles = ["user", "admin", "editor"]; // Extensible role system

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      select: false, // Never return password in queries
    },
    cartData: { type: Object, default: {} },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    refreshTokens: { type: [String], select: false, default: [] },
    has_placed_first_order: { type: Boolean, default: false },
    coupon: { type: String, unique: true, sparse: true },
    isCouponActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
