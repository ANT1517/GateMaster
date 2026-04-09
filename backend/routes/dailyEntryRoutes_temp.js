import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/* ---------------------------------------------------------
   🔹 1. SCAN QR FOR ENTRY OR EXIT
--------------------------------------------------------- */
router.post("/scan", async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Check if user exists in profiles
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) return res.status(404).json({ message: "User not found" });

    // Find today's record
    const { data: record, error: recordError } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (recordError) throw recordError;

    if (!record) {
      // First scan → ENTRY
      const { data: newRecord, error: insertError } = await supabase
        .from("daily_entries")
        .insert([{
          user_id: userId,
          entry_time: new Date().toISOString(),
          status: "inside",
          date: today,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json({ message: "Entry marked successfully", record: newRecord });
    } else {
      // Second scan → EXIT
      if (record.exit_time) {
        return res.json({ message: "Already exited today" });
      }

      const { data: updatedRecord, error: updateError } = await supabase
        .from("daily_entries")
        .update({
          exit_time: new Date().toISOString(),
          status: "exited",
        })
        .eq("id", record.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return res.json({ message: "Exit marked successfully", record: updatedRecord });
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
    const { data: record, error } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_time", start.toISOString())
      .lte("entry_time", end.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!record) {
      return res.json({ status: "no-entry" });
    }

    return res.json({
      status: record.status,
      entryTime: record.entry_time,
      exitTime: record.exit_time
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
    const { data: recent, error } = await supabase
      .from("daily_entries")
      .select(`
        *,
        profiles (
          full_name,
          roll_no
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(
      recent.map((entry) => ({
        name: entry.profiles?.full_name || "Unknown",
        rollNo: entry.profiles?.roll_no || "N/A",
        action: entry.exit_time ? "Exited" : "Entered",
        time: entry.exit_time || entry.entry_time,
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
    const { data: records, error } = await supabase
      .from("daily_entries")
      .select(`
        *,
        profiles (
          full_name,
          roll_no,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = records.map((r) => ({
      name: r.profiles?.full_name || "Unknown",
      rollNo: r.profiles?.roll_no || "N/A",
      email: r.profiles?.email || "N/A",
      entryTime: r.entry_time || null,
      exitTime: r.exit_time || null,
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
