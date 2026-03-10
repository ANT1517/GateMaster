import express from "express";
import GatePass from "../models/GatePass.js";
import User from "../models/User.js";
import QRCode from "qrcode";

const router = express.Router();

// 🔹 Get all passes
router.get("/", async (req, res) => {
  try {
    const passes = await GatePass.find().populate("userId");
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Request new pass
router.post("/request", async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const pass = new GatePass({ userId, reason, status: "pending" });
    await pass.save();
    res.status(201).json(pass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update pass status (Approve / Reject)
router.put("/:id", async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id).populate("userId");
    if (!pass) return res.status(404).json({ message: "Pass not found" });

    pass.status = req.body.status || pass.status;

    // ✅ Generate QR only when approved
    if (pass.status === "approved") {
      const qrData = JSON.stringify({ passId: pass._id, userId: pass.userId._id });
      pass.qrCode = await QRCode.toDataURL(qrData);
    }

    await pass.save();
    res.json(pass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
