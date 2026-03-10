import mongoose from "mongoose";

const gatePassSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  entryTime: { type: Date },
  exitTime: { type: Date },
  qrCode: { type: String }, // store QR image data (base64)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("GatePass", gatePassSchema);
