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
app.set("trust proxy", 1);

// middlewares
securityMiddleware(app);

const corsOptions = {
  origin: [
    // "http://localhost:5173",
    // "http://localhost:5174",
    "https://cousinsfashion.in",
    "https://admin.cousinsfashion.in",
  ],
  methods: ["GET", "POST", "DELETE"], // Explicitly allowed methods
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204, // Proper status for OPTIONS responses
  maxAge: 86400, // Cache preflight responses for 24 hours
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.json({ limit: "30kb" })); // For API requests
app.use(express.urlencoded({ limit: "40kb", extended: true })); // For form data

const RateLimiter = (max) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    message: "Too many requests, please try later",
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable deprecated headers
    keyGenerator: (req) => {
      // Use X-Forwarded-For properly
      return req.ip;
    },
  });
app.use("/api/order/addPaymentScreenshot", RateLimiter(3));
app.use("/api/order/addDesignImage", RateLimiter(3));
app.use("/api/order/place", RateLimiter(10));
app.use("/api/order/googlepay", RateLimiter(10));
app.use("/api/order/verifyCode", RateLimiter(3));
app.use("/api/auth/login", RateLimiter(5));
app.use("/api/auth/register", RateLimiter(3));
app.use("/api/auth/refresh", RateLimiter(5));

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
