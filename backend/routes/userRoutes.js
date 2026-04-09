import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../config/supabase.js";
import QRCode from "qrcode";

const router = express.Router();

// 🔹 Register User + Generate Permanent QR
router.post("/register", async (req, res) => {
  try {
    const { name, rollNo, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user profile in Supabase
    // Note: Since we're using Supabase as a DB, we're assuming the 'profiles' table exists.
    // In a real Supabase Auth setup, registration happens via auth.signUp(),
    // but here we follow the backend's original logic of custom registration.
    
    // First, let's generate the QR data (we need an ID, but for now we'll use email if ID is not available yet)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert([{ 
        full_name: name, 
        roll_no: rollNo, 
        email, 
        password: hashedPassword, 
        role: role || "student" 
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // ✅ Generate permanent QR containing student userId
    const qrData = JSON.stringify({ userId: newUser.id });
    const qrCode = await QRCode.toDataURL(qrData);

    // Update with QR code
    const { data: updatedUser, error: updateError } = await supabase
      .from("profiles")
      .update({ qr_code: qrCode })
      .eq("id", newUser.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ TEMP: Generate permanent QR codes for existing users
router.put("/generate-qr", async (req, res) => {
  try {
    const { data: usersWithoutQR, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .or("qr_code.is.null,qr_code.eq.");

    if (fetchError) throw fetchError;

    if (!usersWithoutQR || usersWithoutQR.length === 0) {
      return res.json({ message: "All users already have QR codes" });
    }

    const updatedUsers = [];

    for (const user of usersWithoutQR) {
      const qrData = JSON.stringify({ userId: user.id });
      const qrCode = await QRCode.toDataURL(qrData);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ qr_code: qrCode })
        .eq("id", user.id);

      if (updateError) console.error(`Error updating QR for ${user.email}:`, updateError);
      
      updatedUsers.push({
        name: user.full_name,
        email: user.email,
        id: user.id,
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
    const { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ password: hashed })
      .eq("email", email);

    if (updateError) throw updateError;

    res.json({ message: "Password reset successful", email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔹 Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Step 2: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Step 3: Send user data (without password)
    const { password: _, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
