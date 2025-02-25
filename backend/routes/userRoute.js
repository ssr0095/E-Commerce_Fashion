import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  applyCoupon,
  getUserInfo,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/verifyCode", authUser, applyCoupon);
userRouter.post("/userInfo", authUser, getUserInfo);

export default userRouter;
