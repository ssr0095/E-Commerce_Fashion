import express from "express";
import {
  login,
  register,
  logout,
  refreshToken,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
// authRouter.post("/admin", adminLogin);
authRouter.post("/refresh", refreshToken);

export default authRouter;
