import jwt from "jsonwebtoken";

class TokenService {
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        issuer: "cousinsfashion.in",
        subject: user._id.toString(),
        audience: ["admin", "user"],
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN || "30",
      }
    );
  }

  static generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        version: Date.now(), // Add version for forced logout
      },
      process.env.JWT_REFRESH_SECRET,
      {
        issuer: "cousinsfashion.in",
        audience: ["admin", "user"],
        algorithm: "HS256",
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        subject: user._id.toString(),
      }
    );
  }

  static verifyAccessToken(token) {
    // try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "cousinsfashion.in",
      audience: ["admin", "user"],
      algorithm: "HS256",
    });
    // } catch (error) {
    //   if (error.name === "TokenExpiredError") {
    //     throw new Error("TOKEN_EXPIRED");
    //   }
    //   throw new Error("INVALID_TOKEN");
    // }
  }

  static verifyRefreshToken(token) {
    // try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: "cousinsfashion.in",
      audience: ["admin", "user"],
      algorithm: "HS256",
    });
    // } catch (error) {
    //   if (error.name === "TokenExpiredError") {
    //     throw new Error("REFRESH_TOKEN_EXPIRED");
    //   }
    //   throw new Error("INVALID_REFRESH_TOKEN");
    // }
  }
}

export default TokenService;
