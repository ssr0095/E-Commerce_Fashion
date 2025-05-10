import express from "express";
import {
  placeOrder,
  placeOrderGooglePay,
  placeOrderStripe,
  placeOrderRazorpay,
  getUserOrder,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  updatePaymentStatus,
  addPaymentScreenshot,
  addDesignImage,
  applyCoupon,
} from "../controllers/orderController.js";
import { authUser, authAdmin } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", authAdmin, allOrders);
orderRouter.post("/status", authAdmin, updateStatus);
orderRouter.post("/paymentstatus", authAdmin, updatePaymentStatus);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/googlepay", authUser, placeOrderGooglePay);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/getuserorder", authUser, getUserOrder);
orderRouter.post("/verifyCode", authUser, applyCoupon);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

orderRouter.post(
  "/addPaymentScreenshot",
  upload.single("paymentImage"),
  authUser,
  addPaymentScreenshot
);
orderRouter.post(
  "/addDesignImage",
  upload.single("designImage"),
  authUser,
  addDesignImage
);

export default orderRouter;
