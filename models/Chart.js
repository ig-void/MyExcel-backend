const mongoose = require("mongoose")

const chartSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["line", "bar", "pie", "scatter", "3d-column"],
      required: true,
    },
    xAxis: {
      type: String,
      required: true,
    },
    yAxis: {
      type: String,
      required: true,
    },
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Chart", chartSchema)
