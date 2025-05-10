import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      // Only require userId for certain actions
      return !["LOGIN_FAILED", "REGISTER"].includes(this.action);
    },
  },
  email: { type: String }, // Track email for login attempts
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

// Add to your auditSchema
auditSchema.index({ action: 1 });
auditSchema.index({ userId: 1 });
auditSchema.index({ timestamp: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditSchema);
