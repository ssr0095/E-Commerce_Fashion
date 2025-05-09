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

// App Config
const app = express();
const port = process.env.PORT || 8000;
connectDB();
// connectCloudinary();

const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many upload attempts, please try later",
});


// middlewares
const corsOptions = {
  origin: ['http://localhost:5173', 'https://cousinsfashion.in'],
  credentials: true, // This is crucial
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));
app.use("/api/order/payment", Limiter);
// app.use('/api/auth/login',Limiter);
// app.use('/api/auth/refresh',Limiter);

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use('/api/auth', userRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("Server started on PORT : " + port));
