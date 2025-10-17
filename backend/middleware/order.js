const validateOrder = (req, res, next) => {
  const { items, amount, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order items",
    });
  }

  if (typeof amount !== "number" || amount < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid order amount",
    });
  }

  // Validate address structure
  const requiredAddressFields = [
    "street",
    "city",
    "zipcode",
    "country",
    "phone",
  ];
  for (const field of requiredAddressFields) {
    if (!address[field]?.trim()) {
      return res.status(400).json({
        success: false,
        message: `Missing address field: ${field}`,
      });
    }
  }

  next();
};

export default validateOrder;
