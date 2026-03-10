import mongoose from "mongoose";

const entryLogSchema = new mongoose.Schema(
  {
    passId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GatePass",
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
      default: "inside",
    },
  },
  { timestamps: true }
);

const EntryLog = mongoose.model("EntryLog", entryLogSchema);

export default EntryLog;
