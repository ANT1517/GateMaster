import express from "express";
import Entry from "../models/Entry.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const entry = await Entry.create(req.body);
  res.json(entry);
});

router.get("/", async (req, res) => {
  const all = await Entry.find().sort({ time: -1 });
  res.json(all);
});

export default router;
