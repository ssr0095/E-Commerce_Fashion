import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import rateLimit from "express-rate-limit";
// import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import authRouter from "./routes/authRoute.js";
import { securityMiddleware } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";

// App Config
const app = express();
const port = process.env.PORT || 8000;
connectDB();
// connectCloudinary();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per window
  message: "Too many attempts, please try later",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try later",
});

const useLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 requests per window
  message: "Too many attempts, please try later",
});

// middlewares
securityMiddleware(app);

const corsOptions = {
  origin: [
    // "http://localhost:5173",
    // "http://localhost:5174",
    "https://cousinsfashion.in",
    "https://admin.cousinsfashion.in",
  ],
  // credentials: true, // This is crucial
  allowedMethods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "30kb" })); // For API requests
app.use(express.urlencoded({ limit: "30kb", extended: true })); // For form data
app.options("*", cors(corsOptions));
app.use("/api/order/addPaymentScreenshot", uploadLimiter);
app.use("/api/order/addDesignImage", uploadLimiter);
app.use("/api/order/place", useLimiter);
app.use("/api/order/googlepay", useLimiter);
app.use("/api/order/verifyCode", uploadLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/refresh", authLimiter);

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("Server started on PORT : " + port));
