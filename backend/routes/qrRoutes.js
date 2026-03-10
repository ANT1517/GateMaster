import express from "express";
import GatePass from "../models/GatePass.js";
import EntryLog from "../models/EntryLog.js";

const router = express.Router();

// Mark entry/exit based on QR code scan
router.post("/scan", async (req, res) => {
  try {
    const { passId, userId, rollNo } = req.body;

    const pass = await GatePass.findById(passId);
    if (!pass) return res.status(404).json({ message: "Pass not found" });

    // If not entered yet -> mark entry
    if (!pass.entryTime) {
      pass.entryTime = new Date();
      await pass.save();
      await EntryLog.create({ userId, action: "entry" });
      return res.json({ message: `Entry marked for ${rollNo}` });
    }

    // If already entered but not exited -> mark exit
    if (!pass.exitTime) {
      pass.exitTime = new Date();
      await pass.save();
      await EntryLog.create({ userId, action: "exit" });
      return res.json({ message: `Exit marked for ${rollNo}` });
    }

    res.json({ message: "Already marked entry & exit" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
