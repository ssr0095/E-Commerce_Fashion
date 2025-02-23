import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  applyCoupon,
  addScreenShot,
  getUserInfo,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/verifyCode", authUser, applyCoupon);
userRouter.post("/userInfo", authUser, getUserInfo);
userRouter.post(
  "/addScreenShot",
  upload.single("image"),
  authUser,
  addScreenShot
);

export default userRouter;
