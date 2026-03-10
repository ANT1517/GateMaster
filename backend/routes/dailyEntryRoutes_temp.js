import express from "express";
import DailyEntry from "../models/DailyEntry.js";
import User from "../models/User.js";

const router = express.Router();

/* ---------------------------------------------------------
   🔹 1. SCAN QR FOR ENTRY OR EXIT
--------------------------------------------------------- */
router.post("/scan", async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let record = await DailyEntry.findOne({ userId, date: today });

    if (!record) {
      // First scan → ENTRY
      record = await DailyEntry.create({
        userId,
        entryTime: new Date(),
        status: "inside",
        date: today,
      });
      return res.json({ message: "Entry marked successfully", record });
    } else {
      // Second scan → EXIT
      if (record.exitTime) {
        return res.json({ message: "Already exited today" });
      }

      record.exitTime = new Date();
      record.status = "exited";
      await record.save();

      return res.json({ message: "Exit marked successfully", record });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   🔹 2. CHECK TODAY'S ENTRY STATUS FOR STUDENT DASHBOARD
--------------------------------------------------------- */
router.get("/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get local "today" range
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Find today’s record within the time range
    const record = await DailyEntry.findOne({
      userId,
      entryTime: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    if (!record) {
      return res.json({ status: "no-entry" });
    }

    return res.json({
      status: record.status,
      entryTime: record.entryTime,
      exitTime: record.exitTime
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   🔹 3. RECENT ACTIVITY FOR GUARD DASHBOARD
--------------------------------------------------------- */
router.get("/recent", async (req, res) => {
  try {
    const recent = await DailyEntry.find()
      .populate("userId", "name rollNo")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(
      recent.map((entry) => ({
        name: entry.userId?.name || "Unknown",
        rollNo: entry.userId?.rollNo || "N/A",
        action: entry.exitTime ? "Exited" : "Entered",
        time: entry.exitTime || entry.entryTime,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   🔹 4. ALL ENTRY/EXIT LOGS FOR ADMIN PAGE
--------------------------------------------------------- */
router.get("/all", async (req, res) => {
  try {
    const records = await DailyEntry.find()
      .populate("userId", "name rollNo email")
      .sort({ createdAt: -1 });

    const formatted = records.map((r) => ({
      name: r.userId?.name || "Unknown",
      rollNo: r.userId?.rollNo || "N/A",
      email: r.userId?.email || "N/A",
      entryTime: r.entryTime || null,
      exitTime: r.exitTime || null,
      status: r.status,
      date: r.date,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ message: "Error fetching records" });
  }
});

export default router;
