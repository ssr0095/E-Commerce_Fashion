import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Authorization token required" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }

    req.user = decoded; // Attach full user data
    next();
  } catch (error) {
    console.error('JWT Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please login again" 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: "Invalid token" 
    });
  }
};

export default authUser;