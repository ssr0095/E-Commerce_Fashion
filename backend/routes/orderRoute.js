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
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/paymentstatus", adminAuth, updatePaymentStatus);

// Payment Features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/googlepay", authUser, placeOrderGooglePay);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// User Feature
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/getuserorder", authUser, getUserOrder);

// verify payment
orderRouter.post("/verifyStripe", authUser, verifyStripe);
orderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

export default orderRouter;
