// ✅ Enhanced error handler
export const errorHandler = (err, req, res, next) => {
  // Don't log sensitive data in production
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      error: err.stack,
      body: req.body,
      user: req.user?.id,
    });
  } else {
    // Production: Log to monitoring service (e.g., Sentry)
    console.error("Error:", {
      message: err.message,
      path: req.path,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  }

  // Security audit logging
  if ([401, 403].includes(err.statusCode)) {
    createAuditLog({
      action: "SECURITY_ERROR",
      userId: req.user?._id,
      metadata: {
        error: err.message,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    }).catch(console.error);
  }

  // Structured error responses
  const errorResponse = {
    code: err.code || "SERVER_ERROR",
    message: process.env.NODE_ENV === "production" ? err.message : err.stack, // Only show stack in dev
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    errorResponse.message = "An unexpected error occurred";
  }

  res.status(err.statusCode || 500).json(errorResponse);
};
