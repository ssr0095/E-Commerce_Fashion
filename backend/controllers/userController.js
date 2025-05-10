import userModel from "../models/userModel.js";

// controllers/userController.js
const getUserInfo = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("name email coupon isCouponActive cartData")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate cart count
    const cartCount = user.cartData
      ? Object.values(user.cartData).reduce(
          (total, sizes) =>
            total + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
          0
        )
      : 0;

    res.json({
      success: true,
      name: user.name,
      email: user.email,
      coupon: user.coupon,
      cartCount,
      isCouponActive: user.isCouponActive,
    });
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getUserInfo };
