import mongoose from "mongoose";

const dailyEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entryTime: {
      type: Date,
      default: null,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["inside", "exited"],
      default: "exited",
    },
    date: {
      type: String, // store date in YYYY-MM-DD
      required: true,
    },
  },
  { timestamps: true }
);

const DailyEntry = mongoose.model("DailyEntry", dailyEntrySchema);
export default DailyEntry;
