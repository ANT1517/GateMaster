import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Mark entry/exit based on QR code scan
router.post("/scan", async (req, res) => {
  try {
    const { passId, userId, rollNo } = req.body;

    const { data: pass, error: fetchError } = await supabase
      .from("gate_passes")
      .select("*")
      .eq("id", passId)
      .single();

    if (fetchError || !pass) return res.status(404).json({ message: "Pass not found" });

    // If not entered yet -> mark entry
    if (!pass.entry_time) {
      const { error: updatePassError } = await supabase
        .from("gate_passes")
        .update({ entry_time: new Date().toISOString() })
        .eq("id", passId);
      
      if (updatePassError) throw updatePassError;

      const { error: insertLogError } = await supabase
        .from("daily_entries")
        .insert([{ user_id: userId, status: "inside", date: new Date().toISOString().split("T")[0], entry_time: new Date().toISOString() }]);

      if (insertLogError) throw insertLogError;

      return res.json({ message: `Entry marked for ${rollNo}` });
    }

    // If already entered but not exited -> mark exit
    if (!pass.exit_time) {
      const { error: updatePassError } = await supabase
        .from("gate_passes")
        .update({ exit_time: new Date().toISOString() })
        .eq("id", passId);
      
      if (updatePassError) throw updatePassError;

      const { error: updateLogError } = await supabase
        .from("daily_entries")
        .update({ exit_time: new Date().toISOString(), status: "exited" })
        .eq("user_id", userId)
        .eq("date", new Date().toISOString().split("T")[0])
        .is("exit_time", null);

      if (updateLogError) throw updateLogError;

      return res.json({ message: `Exit marked for ${rollNo}` });
    }

    res.json({ message: "Already marked entry & exit" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
