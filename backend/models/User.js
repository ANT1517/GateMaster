import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    rollNo: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["student", "admin", "guard"],
      default: "student",
    },
    qrCode: {
      type: String, // permanent student QR code for daily entry
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
