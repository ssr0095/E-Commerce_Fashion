import AuditLog from "../models/auditModel.js";

export const createAuditLog = async (logData) => {
  try {
    // For failed logins, we might not have a userId
    const log = new AuditLog({
      action: logData.action,
      userId: logData.userId || null, // Explicitly set to null if not provided
      email: logData.email, // Capture email for login attempts
      metadata: logData.metadata || {},
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking main flow
  }
};

// Optional: Get logs for a user
export const getUserAuditLogs = async (userId, limit = 50) => {
  return AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean();
};
