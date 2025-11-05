import User from "../models/userModel.js";
import tokenService from "../services/tokenService.js";
import { createAuditLog } from "./auditController.js";
import { validationResult } from "express-validator";

const googleAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Google access token required" });
    }

    // Use the access token to get user info from Google API
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      return res.status(401).json({ message: "Invalid Google access token" });
    }

    const userInfo = await userInfoResponse.json();
    const { email, name, sub: googleId, picture } = userInfo;

    if (!email) {
      return res.status(400).json({ message: "Invalid user data from Google" });
    }

    // Continue with your existing user creation/login logic
    let user = await User.findOne({ email }).select("+refreshTokens");

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        picture,
        role: "user",
        isActive: true,
        authProvider: "google",
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
      }
      user.lastLogin = new Date();
    }

    user.cleanExpiredRefreshTokens();

    // Generate YOUR application tokens
    const AccessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    // Add refresh token to user
    user.refreshTokens = [
      ...(user.refreshTokens || []),
      {
        token: refreshToken,
        provider: "google",
        expiresAt: new Date(
          Date.now() +
            (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) ||
              7 * 24 * 3600 * 1000)
        ),
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    ];

    await user.save();

    await createAuditLog({
      action: user.isNew ? "REGISTER" : "LOGIN",
      userId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        authMethod: "google",
      },
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge:
          parseInt(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 3600 * 1000,
      })
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          accessToken: AccessToken,
        },
      });
  } catch (error) {
    console.error("Google auth error:", error);

    if (error.message.includes("Invalid token")) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, isAdminLogin = false } = req.body;

    const user = await User.findOne({
      email,
      role: isAdminLogin ? "admin" : { $in: ["user", "admin"] },
    }).select("+password +isActive +refreshTokens +authProvider");

    // Check if user can login with credentials
    if (user && !user.canLoginWith("credentials")) {
      return res.status(401).json({
        message: "Please use Google to login",
        code: "USE_GOOGLE_LOGIN",
      });
    }

    // Additional check if it's admin login but user is not admin
    if (isAdminLogin && user?.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized access" });
    }

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

    // CREATE TOKENS
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    user.lastLogin = new Date();

    user.cleanExpiredRefreshTokens();
    user.refreshTokens = [
      ...(user.refreshTokens || []),
      {
        token: refreshToken,
        provider: "credentials",
        expiresAt: new Date(
          Date.now() +
            (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) ||
              7 * 24 * 3600 * 1000)
        ),
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    ];

    await user.save();

    await createAuditLog({
      action: "LOGIN",
      userId: user._id,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        authMethod: "credentials",
      },
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        maxAge: new Date(
          Date.now() +
            (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) ||
              7 * 24 * 3600 * 1000)
        ),
      })
      .status(200)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    // VALIDATE
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

    // CREATE
    const user = new User({
      name,
      email,
      password,
      role: "user", // Explicitly set to user for registration
    });

    // RETURN TOKEN
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    user.cleanExpiredRefreshTokens();
    user.refreshTokens = [
      {
        token: refreshToken,
        provider: "credentials",
        expiresAt: new Date(
          Date.now() +
            (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) ||
              7 * 24 * 3600 * 1000)
        ), // Add new Date()
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    ];

    await user.save();

    await createAuditLog({
      action: "REGISTER",
      userId: user._id,
      metadata: { ip: req.ip },
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        maxAge: new Date(
          Date.now() +
            (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) ||
              7 * 24 * 3600 * 1000)
        ),
      })
      .status(201)
      .json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        code: "REFRESH_TOKEN_REQUIRED",
        message: "Refresh token required",
      });
    }

    let decoded;
    try {
      decoded = tokenService.verifyRefreshToken(refreshToken);
    } catch (error) {
      // Clear invalid refresh token
      res.clearCookie("refreshToken");
      return res.status(401).json({
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    // Find the specific refresh token
    const existingTokenIndex = user.refreshTokens.findIndex(
      (rt) => rt.token === refreshToken
    );

    if (existingTokenIndex === -1) {
      // Possible token theft - clear all refresh tokens
      user.refreshTokens = [];
      await user.save();
      res.clearCookie("refreshToken");
      return res.status(401).json({
        code: "TOKEN_REVOKED",
        message: "Security violation detected",
      });
    }

    const existingToken = user.refreshTokens[existingTokenIndex];

    // Check if refresh token expired
    if (existingToken.expiresAt < new Date()) {
      user.refreshTokens.splice(existingTokenIndex, 1);
      await user.save();
      res.clearCookie("refreshToken");
      return res.status(401).json({
        code: "REFRESH_TOKEN_EXPIRED",
        message: "Refresh token expired",
      });
    }

    // Generate new tokens
    const newAccessToken = tokenService.generateAccessToken(user);
    const newRefreshToken = tokenService.generateRefreshToken(user);

    // Replace old refresh token with new one (rotation)
    user.refreshTokens[existingTokenIndex] = {
      token: newRefreshToken,
      provider: existingToken.provider,
      expiresAt: new Date(
        Date.now() +
          (parseInt(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 3600 * 1000)
      ),
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip,
      createdAt: new Date(),
    };

    // Clean up expired tokens
    user.cleanExpiredRefreshTokens();

    await user.save();

    // Set new refresh token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge:
        parseInt(process.env.REFRESH_TOKEN_MAX_AGE) || 7 * 24 * 3600 * 1000,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.clearCookie("refreshToken");
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = tokenService.verifyRefreshToken(refreshToken);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            $pull: { refreshTokens: { token: refreshToken } },
          });
        }
      } catch (error) {
        console.error("Error removing refresh token:", error);
      }
    }

    res.clearCookie("refreshToken").sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error);
    res.sendStatus(500);
  }
};

const logoutFromAll = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = tokenService.verifyRefreshToken(refreshToken); // No verification needed for logout
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, {
            $set: { refreshTokens: [] },
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
        return res.sendStatus(500);
      }
    }

    res.clearCookie("refreshToken").sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error);
    res.sendStatus(500);
  }
};

const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.split(" ")[1];
    const decoded = tokenService.verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("name email role");
    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
};

export {
  login,
  register,
  refreshToken,
  logout,
  logoutFromAll,
  googleAuth,
  verifyToken,
};
