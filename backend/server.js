import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

// Import route files
import userRoutes from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import gatePassRoutes from "./routes/gatePassRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import dailyEntryRoutes from "./routes/dailyEntryRoutes_temp.js";

// ✅ Initialize app FIRST
const app = express();
dotenv.config();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Register routes
app.use("/api/users", userRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/passes", gatePassRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/daily-entry", dailyEntryRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
