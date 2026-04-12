import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    itbis: {
      type: Number,
      required: true,
      default: 18,
    },
  },
  {
    timestamps: true,
    collection: "Config",
  }
);

const Config = mongoose.model("Config", configSchema);

export default Config;