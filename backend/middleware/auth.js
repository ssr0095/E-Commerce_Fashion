import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Role-based access control middleware
export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
        maxAge: process.env.JWT_EXPIRES_IN,
      });

      // Fetch fresh user data
      const user = await User.findById(decoded.id).select(
        "email role isActive"
      );

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Account deactivated" });
      }

      // Check role permissions
      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Unauthorized access attempt by ${user.email}`);
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = { id: decoded.id, role: user.role };
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
