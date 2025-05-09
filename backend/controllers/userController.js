import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => {
  try {
    return jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );
  } catch (error) {
    console.error("Token creation error:", error);
    throw new Error("Failed to create authentication token");
  }
};

const createRefreshToken = (id) => {
  try {
    return jwt.sign(
      { id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // Refresh token lasts 7 days
    );
  } catch (error) {
    console.error("Refresh token creation error:", error);
    throw new Error("Failed to create refresh token");
  }
};

// In refreshToken controller:
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists
    const user = await userModel.findById(decoded.id);
    if (!user) return res.sendStatus(403);

    // Issue new tokens
    const newAccessToken = createToken(user._id);
    const newRefreshToken = createRefreshToken(user._id);

    return res.json({ 
      token: newAccessToken,
      refreshToken: newRefreshToken 
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const token = createToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Password strength check
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Generate tokens
    const token = createToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = createToken(process.env.ADMIN_ID);
    res.json({
      success: true,
      token,
      isAdmin: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Admin login failed",
    });
  }
};

// Apply Coupon on New User's First Order
const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const user = await userModel.findById(userId);

    if (user?.has_placed_first_order) {
      return res.status(403).json({
        success: false,
        message: "Coupon is only applicable on first orders",
      });
    }

    if (couponCode === process.env.COUSINS_COUPION) {
      return res.json({
        success: true,
        message: "Coupon applied",
        discount: process.env.FIRST_ORDER_DISCOUNT || 10,
      });
    }

    const couponOwner = await userModel.findOne({
      coupon: couponCode,
      isCouponActive: true,
    });

    if (!couponOwner) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    return res.json({
      success: true,
      message: "Coupon applied",
      discount: couponOwner.couponDiscount || 10,
    });
  } catch (error) {
    console.error("Coupon application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to apply coupon",
    });
  }
};

// controllers/userController.js
const getUserInfo = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("name email coupon isCouponActive cartData")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate cart count
    const cartCount = user.cartData
      ? Object.values(user.cartData).reduce(
          (total, sizes) =>
            total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
          0
        )
      : 0;

    res.json({
      success: true,
      name: user.name,
      email: user.email,
      coupon: user.coupon,
      cartCount,
      isCouponActive: user.isCouponActive,
    });
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  applyCoupon,
  getUserInfo,
  createRefreshToken,
  refreshToken,
};
