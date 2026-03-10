import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import QRCode from "qrcode";

const router = express.Router();

// 🔹 Register User + Generate Permanent QR
router.post("/register", async (req, res) => {
  try {
    const { name, rollNo, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, rollNo, email, password: hashedPassword, role });

    // ✅ Generate permanent QR containing student userId
    const qrData = JSON.stringify({ userId: newUser._id });
    newUser.qrCode = await QRCode.toDataURL(qrData);

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ TEMP: Generate permanent QR codes for existing users
router.put("/generate-qr", async (req, res) => {
  try {
    const usersWithoutQR = await User.find({
      $or: [{ qrCode: { $exists: false } }, { qrCode: null }],
    });

    if (usersWithoutQR.length === 0) {
      return res.json({ message: "All users already have QR codes" });
    }

    const updatedUsers = [];

    for (const user of usersWithoutQR) {
      const qrData = JSON.stringify({ userId: user._id });
      user.qrCode = await QRCode.toDataURL(qrData);
      await user.save();
      updatedUsers.push({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    }

    res.json({
      message: "QR codes generated successfully for existing users",
      count: updatedUsers.length,
      updatedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error generating QR codes",
      error: err.message,
    });
  }
});

// ⚙️ TEMP: Reset password manually for testing
router.put("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successful", email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Export at the very bottom
export default router;
// 🔹 Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Step 2: Compare password (plain text vs hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 3: Send user data (without password)
    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
