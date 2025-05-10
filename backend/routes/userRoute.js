import express from "express";
import { getUserInfo } from "../controllers/userController.js";
import { authUser } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/userInfo", authUser, getUserInfo);

export default userRouter;
