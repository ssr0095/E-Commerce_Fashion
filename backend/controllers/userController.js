import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import orderModel from "../models/orderModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apply Coupon on New User's First Order
const applyCoupon = async (req, res) => {
  const { userId, couponCode } = req.body;

  try {
    const user = await userModel.findById(userId);

    if (user?.has_placed_first_order) {
      return res.json({
        success: false,
        message: "Coupon is only applicable on first orders.",
      });
    }

    if (couponCode === process.env.COUSINS_COUPION) {
      return res.json({
        success: true,
        message: "Coupon applied",
        discount: 10,
      });
    }

    const couponOwner = await userModel.findOne({
      coupon: couponCode,
      isCouponActive: true,
    });

    if (!couponOwner) {
      return res.json({
        success: false,
        message: "Invalid or expired coupon.",
      });
    }

    return res.json({ success: true, message: "Coupon applied", discount: 10 });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const addScreenShot = async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    // console.log(userId + ": user");
    // console.log(token + ": token");
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const image = req.file; // Extract the uploaded file

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image.path, {
      resource_type: "image",
    });

    const imageUrl = result.secure_url;
    // console.log(imageUrl);
    const user = await userModel.findByIdAndUpdate(userId, {
      paymentScreenshot: imageUrl,
    });
    const order = await orderModel.findByIdAndUpdate(orderId, { payment: -1 });
    // console.log(user + "jjjjjjjjjjjjjjj");
    if (!user || !order) {
      return res.json({
        success: false,
        message: "User",
      });
    }
    res.json({
      success: true,
      message: "Screenshot uploaded successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  const { userId } = req.body;
  // console.log(userId);

  try {
    const { name, email, coupon, isCouponActive } = await userModel.findById(
      userId
    );

    // console.log(name, email, coupon, isCouponActive);
    if (!name) {
      return res.json({
        success: false,
        message: "User not fount",
      });
    }
    res.json({
      success: true,
      name,
      email,
      coupon,
      isCouponActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  applyCoupon,
  addScreenShot,
  getUserInfo,
};
