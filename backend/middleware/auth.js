import jwt from "jsonwebtoken";

// In authUser middleware:
const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      maxAge: '1h' // Matches token expiry
    });
    
    req.user = {id: decoded.id};
    next();
  } catch (err) {
    // Handle specific errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        code: 'TOKEN_EXPIRED',
        message: 'Token expired. Please refresh your token' 
      });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

export default authUser;