import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import { uploadToR2 } from "../config/cloudflare.js";
import { v4 as uuidv4 } from "uuid";
import validateFile from "../utils/fileValidation.js";
import { createAuditLog } from "./auditController.js";
import crypto from "crypto";
// global variables
const currency = process.env.CURRENCY;
const deliveryCharge = process.env.DELIVERY_FEE;
const COUPON = process.env.FIRST_ORDER_DISCOUNT;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const user = await userModel.findByIdAndUpdate(userId, { cartData: {} });
    if (!user?.has_placed_first_order) {
      const couponCode = `${user.name.toUpperCase().trim()}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      await userModel.findByIdAndUpdate(userId, {
        coupon: couponCode,
        isCouponActive: true,
        has_placed_first_order: true,
      });
    }
    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using GoogePay Method
const placeOrderGooglePay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address, isCustomizable } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Google Pay",
      date: Date.now(),
      isCustomizable,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const user = await userModel.findByIdAndUpdate(userId, { cartData: {} });
    if (!user?.has_placed_first_order) {
      const couponCode = `${user.name
        .substring(0, 4)
        .toUpperCase()
        .trim()}${Math.floor(1000 + Math.random() * 9000)}`;
      await userModel.findByIdAndUpdate(userId, {
        coupon: couponCode,
        isCouponActive: true,
        has_placed_first_order: true,
      });
    }

    await createAuditLog({
      action: "ORDER PLACED",
      userId: userId,
      metadata: { ip: req.ip },
    });

    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const userId = req.user.id;
  const { orderId, success } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
      notes: {
        orderId: newOrder._id.toString(),
        //   user_id: userId.toString(),
      },
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        orderModel.findByIdAndDelete(newOrder._id);
        return res.json({ success: false, message: error });
      }
      return res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId, // Your database order ID from frontend
    } = req.body;
    // console.log(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      orderModel.findByIdAndDelete(orderId);

      return res.json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: 1 });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Forntend
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.body;

    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Forntend
const getUserOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById({ _id: orderId });
    const user = await userModel.findById({ _id: order.userId });
    // console.log("userrrr: " + user);
    res.json({ success: true, order, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { payment });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const addPaymentScreenshot = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot not uploaded",
      });
    }

    validateFile(req.file);

    // Upload to R2
    const fileName = `payments/${uuidv4()}-${req.file.originalname}`;
    const imageUrl = await uploadToR2(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    // Update order
    const order = await orderModel.findByIdAndUpdate(orderId, {
      paymentScreenshot: imageUrl,
      payment: -1,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Payment screenshot uploaded",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addDesignImage = async (req, res) => {
  try {
    const { orderId, designDetail } = req.body;

    if (!req.file || !designDetail) {
      return res.status(400).json({
        success: false,
        message: "Design image or detail missing",
      });
    }

    // Upload to R2
    const fileName = `designs/${uuidv4()}-${req.file.originalname}`;
    const imageUrl = await uploadToR2(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    // Update order
    const order = await orderModel.findByIdAndUpdate(orderId, {
      isCustomizable: true,
      customDesignImage: imageUrl,
      customDesignDetail: designDetail,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Design uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Apply Coupon on New User's First Order
const applyCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode } = req.body;

    // Validate coupon code format
    if (
      !couponCode ||
      typeof couponCode !== "string" ||
      couponCode.length < 6
    ) {
      await createAuditLog({
        action: "INVALID_COUPON_FORMAT",
        userId: userId,
        metadata: { couponCode, ip: req.ip },
      });
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code format",
      });
    }

    const user = await userModel.findById(userId);

    // Check if user has already placed an order
    if (
      user?.has_placed_first_order &&
      couponCode === process.env.COUSINS_COUPON
    ) {
      await createAuditLog({
        action: "COUSINS_COUPON_REJECTED",
        userId: userId,
        metadata: {
          reason: "already_placed_order",
          ip: req.ip,
        },
      });
      return res.status(403).json({
        success: false,
        message: "First-order coupon already used",
      });
    }
    // Check for special coupon
    if (couponCode === process.env.COUSINS_COUPON) {
      await createAuditLog({
        action: "COUSINS_COUPON_APPLIED",
        userId: userId,
        metadata: { ip: req.ip },
      });

      return res.json({
        success: true,
        message: "First-order coupon applied",
        discount: process.env.FIRST_ORDER_DISCOUNT || 10,
      });
    }

    // Check for user referral coupons
    const couponOwner = await userModel.findOne({
      coupon: couponCode,
      isCouponActive: true,
    });

    if (!couponOwner) {
      await createAuditLog({
        action: "INVALID_COUPON_ATTEMPT",
        userId: userId,
        metadata: { couponCode, ip: req.ip },
      });
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon",
      });
    }

    // Check if user is trying to use their own coupon
    if (couponOwner._id.toString() === userId.toString()) {
      await createAuditLog({
        action: "SELF_REFERRAL_ATTEMPT",
        userId: userId,
        metadata: { couponCode, ip: req.ip },
      });
      return res.status(400).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    await createAuditLog({
      action: `REFERRAL_COUPON_APPLIED`,
      userId: userId,
      referrerId: couponOwner._id,
      metadata: {
        couponCode,
        discount: couponOwner.couponDiscount || 10,
        ip: req.ip,
      },
    });

    return res.json({
      success: true,
      message: "Coupon applied",
      discount: couponOwner.couponDiscount || 10,
    });
  } catch (error) {
    await createAuditLog({
      action: "COUPON_ERROR",
      userId: req.user?.id,
      metadata: {
        error: error.message,
        ip: req.ip,
      },
    });

    console.error("Coupon application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process coupon",
    });
  }
};

export {
  verifyRazorpay,
  verifyStripe,
  placeOrder,
  placeOrderGooglePay,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus,
  getUserOrder,
  addPaymentScreenshot,
  addDesignImage,
  applyCoupon,
};
