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
      required: function () {
        return this.authProvider === "credentials";
      },
      select: false,
    },
    googleId: { type: String, sparse: true },
    picture: { type: String },
    authProvider: {
      type: String,
      enum: ["credentials", "google", "both"],
      default: "credentials",
    },
    emailVerified: { type: Date },
    cartData: { type: Object, default: {} },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    refreshTokens: [
      {
        token: String,
        provider: {
          type: String,
          enum: ["credentials", "google"],
          default: "credentials",
        },
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
        deviceInfo: String,
        ipAddress: String,
      },
    ],
    has_placed_first_order: { type: Boolean, default: false },
    coupon: { type: String, unique: true, sparse: true },
    isCouponActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Update the password hashing middleware
userSchema.pre("save", async function (next) {
  // Only hash password if it's modified and exists
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords - handle OAuth users
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // OAuth users don't have passwords
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.cleanExpiredRefreshTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (token) => token.expiresAt > new Date()
  );
};

userSchema.methods.canLoginWith = function (provider) {
  if (this.authProvider === "both") return true;
  return this.authProvider === provider;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
