import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import { uploadToR2 } from "../config/cloudflare.js";
import { v4 as uuidv4 } from "uuid";
import validateFile from "../utils/fileValidation.js";

// global variables
const currency = process.env.CURRENCY;
const deliveryCharge = process.env.DELIVERY_FEE;

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
// Placing orders using COD Method
const placeOrderGooglePay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Google Pay",
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
  const { orderId, success} = req.body;

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
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
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
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
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
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Forntend
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderModel.find({ userId });
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
        message: "Payment screenshot not uploaded" 
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
        message: "Order not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Payment screenshot uploaded" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const addDesignImage = async (req, res) => {
  try {
    const { orderId, designDetail } = req.body;

    if (!req.file || !designDetail) {
      return res.status(400).json({ 
        success: false, 
        message: "Design image or detail missing" 
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
        message: "Order not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Design uploaded successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
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
};
