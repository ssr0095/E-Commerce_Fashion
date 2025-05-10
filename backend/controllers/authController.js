import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { createAuditLog } from "./auditController.js";
import { validationResult } from "express-validator";

const generateTokens = (user) => {
  const commonTokenOptions = {
    issuer: "cousinsfashion.in",
    audience: ["user", "admin"].includes(user.role) ? user.role : "user",
  };

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      ...commonTokenOptions,
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    {
      ...commonTokenOptions,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    }
  );

  return { accessToken, refreshToken };
};

// Unified login controller
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const userType = req.path.includes("admin") ? "admin" : "user";

    const user = await User.findOne({ email, role: userType }).select(
      "+password +isActive +refreshTokens"
    );

    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      await createAuditLog({
        action: "LOGIN_FAILED",
        email, // Track the attempted email
        metadata: {
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          reason: user
            ? !user.isActive
              ? "account_inactive"
              : "invalid_password"
            : "user_not_found",
        },
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.lastLogin = new Date();

    user.refreshTokens = user.refreshTokens.concat(refreshToken);
    await user.save();

    await createAuditLog({
      action: "LOGIN",
      userId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        authMethod: "password",
      },
    });

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
// Enhanced register controller
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
        code: "EMAIL_EXISTS",
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: "user", // Explicitly set to user for registration
    });

    await user.save();
    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens = [refreshToken];
    await user.save();

    await createAuditLog({
      action: "REGISTER",
      userId: user._id,
      metadata: { ip: req.ip },
    });

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens and update refresh token list
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== refreshToken)
      .concat(newRefreshToken);

    await user.save();

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(403).json({ message: "Invalid token" });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.sendStatus(204);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token); // No verification needed for logout

    if (decoded?.id) {
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: token },
      });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error);
    res.sendStatus(500);
  }
};
