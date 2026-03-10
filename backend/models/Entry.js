import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  rollNo: String,
  action: String, // "entry" or "exit"
  time: { type: Date, default: Date.now },
});

export default mongoose.model("Entry", entrySchema);
