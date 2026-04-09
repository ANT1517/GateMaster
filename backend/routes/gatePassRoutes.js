import express from "express";
import { supabase } from "../config/supabase.js";
import QRCode from "qrcode";

const router = express.Router();

// 🔹 Get all passes
router.get("/", async (req, res) => {
  try {
    const { data: passes, error } = await supabase
      .from("gate_passes")
      .select(`
        *,
        profiles (
          full_name,
          roll_no
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(passes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Request new pass
router.post("/request", async (req, res) => {
  try {
    const { userId, reason, type } = req.body;
    const { data: pass, error } = await supabase
      .from("gate_passes")
      .insert([{ 
        user_id: userId, 
        reason, 
        type: type || "regular",
        status: "pending" 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(pass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update pass status (Approve / Reject)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const { data: pass, error: fetchError } = await supabase
      .from("gate_passes")
      .select(`
        *,
        profiles (
          id,
          full_name,
          roll_no
        )
      `)
      .eq("id", req.params.id)
      .single();

    if (fetchError || !pass) return res.status(404).json({ message: "Pass not found" });

    let updatedFields = { status: status || pass.status };

    // ✅ Generate QR only when approved
    if (status === "approved") {
      const qrData = JSON.stringify({ passId: pass.id, userId: pass.profiles?.id });
      updatedFields.qr_code = await QRCode.toDataURL(qrData);
    }

    const { data: updatedPass, error: updateError } = await supabase
      .from("gate_passes")
      .update(updatedFields)
      .eq("id", req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedPass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
