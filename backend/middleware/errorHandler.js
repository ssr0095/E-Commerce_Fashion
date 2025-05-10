export const errorHandler = (err, req, res, next) => {
  // Log the error with more context
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    error: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user?.id,
  });

  // Create audit log for security-related errors
  if ([401, 403, 429].includes(err.statusCode || err.status)) {
    createAuditLog({
      action: "SECURITY_ERROR",
      userId: req.user?._id,
      metadata: {
        error: err.message,
        path: req.path,
        ip: req.ip,
      },
    }).catch(console.error);
  }

  // Handle different error types
  let response = {
    code: "SERVER_ERROR",
    message: "Something went wrong",
  };
  let statusCode = 500;

  if (err.name === "ValidationError") {
    statusCode = 400;
    response = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: Object.entries(err.errors).map(([field, details]) => ({
        field,
        message: details.message,
      })),
    };
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    response = {
      code: "DUPLICATE_ENTRY",
      message: `${field} already exists`,
      field,
    };
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    response = {
      code: "INVALID_TOKEN",
      message: "Invalid authentication token",
    };
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    response = {
      code: "TOKEN_EXPIRED",
      message: "Token expired. Please refresh",
    };
  } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    statusCode = err.statusCode;
    response = {
      code: err.code || "CLIENT_ERROR",
      message: err.message,
    };
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
