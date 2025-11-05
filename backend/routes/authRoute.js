import express from "express";
import {
  login,
  register,
  logout,
  refreshToken,
  googleAuth,
  verifyToken,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshToken);
authRouter.post("/verify", verifyToken);

export default authRouter;
