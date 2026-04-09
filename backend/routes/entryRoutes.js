import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { rollNo, action } = req.body;
    
    // Find user by rollNo
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("roll_no", rollNo)
      .single();

    if (userError || !user) return res.status(404).json({ message: "User not found" });

    const { data: entry, error: insertError } = await supabase
      .from("daily_entries")
      .insert([{ 
        user_id: user.id, 
        status: action === "entry" ? "inside" : "exited",
        date: new Date().toISOString().split("T")[0],
        entry_time: action === "entry" ? new Date().toISOString() : null,
        exit_time: action === "exit" ? new Date().toISOString() : null
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { data: all, error } = await supabase
      .from("daily_entries")
      .select(`
        *,
        profiles (
          full_name,
          roll_no
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
