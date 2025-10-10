import User from "../models/userModel.js";
import tokenService from "../services/tokenService.js";

// Role-based access control middleware
export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = tokenService.verifyAccessToken(token);

      const user = await User.findById(decoded.id).select(
        "email role isActive authProvider refreshTokens"
      );

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Account deactivated" });
      }

      // Check if user has valid refresh tokens for their auth provider
      const validRefreshTokens = user.refreshTokens.filter(
        (rt) =>
          rt.expiresAt > new Date() &&
          (user.authProvider === "both" || rt.provider === user.authProvider)
      );

      if (validRefreshTokens.length === 0) {
        return res.status(401).json({ message: "Session expired" });
      }

      // Role check
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = {
        id: decoded.id,
        role: user.role,
        authProvider: user.authProvider,
      };
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          code: "TOKEN_EXPIRED",
          message: "Token expired. Please refresh",
        });
      }
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

// Shortcuts for common roles
export const authUser = requireRole(); // Any authenticated user
export const authAdmin = requireRole(["admin"]);
export const authEditor = requireRole(["editor", "admin"]);
