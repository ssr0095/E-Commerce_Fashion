import User from "../models/userModel.js";
import tokenService from "../services/tokenService.js";

// Role-based access control middleware
export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
          code: "NO_TOKEN",
          message: "Authentication required",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = tokenService.verifyAccessToken(token);

      const user = await User.findById(decoded.id)
        .select("email role isActive authProvider refreshTokens")
        .lean(); // Use lean() for better performance

      if (!user) {
        return res.status(401).json({
          code: "USER_NOT_FOUND",
          message: "Account not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          code: "ACCOUNT_DISABLED",
          message: "Account has been disabled",
        });
      }

      // Enhanced session validation
      const hasValidSession = user.refreshTokens.some(
        (rt) => rt.expiresAt > new Date() && rt.token && !rt.revoked // Add revoked field to schema
      );

      if (!hasValidSession) {
        return res.status(401).json({
          code: "SESSION_EXPIRED",
          message: "Please login again",
        });
      }

      // Role authorization
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Access denied",
        });
      }

      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          code: "TOKEN_EXPIRED",
          message: "Token expired",
        });
      }

      console.error("Auth middleware error:", error);
      res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Invalid authentication",
      });
    }
  };
};

// Shortcuts for common roles
export const authUser = requireRole(); // Any authenticated user
export const authAdmin = requireRole(["admin"]);
export const authEditor = requireRole(["editor", "admin"]);
