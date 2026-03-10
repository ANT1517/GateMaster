import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import route files
import userRoutes from "./routes/userRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import gatePassRoutes from "./routes/gatePassRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import dailyEntryRoutes from "./routes/dailyEntryRoutes_temp.js"; // ✅ Use your temp file name here

// ✅ Initialize app FIRST
const app = express();
dotenv.config();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect DB
connectDB();

// ✅ Register routes AFTER app initialization
app.use("/api/users", userRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/passes", gatePassRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/daily-entry", dailyEntryRoutes); // ✅ daily entry scanner route

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
