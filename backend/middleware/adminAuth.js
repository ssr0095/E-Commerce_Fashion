import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    // console.log(token);
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    // Verify if the token contains the correct email
    if (token_decode.id !== process.env.ADMIN_ID) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid token. Login Again" });
  }
};

export default adminAuth;
