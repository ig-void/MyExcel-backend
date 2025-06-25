const mongoose = require("mongoose")

const uploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      headers: [String],
      rows: [[mongoose.Schema.Types.Mixed]],
    },
    charts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chart",
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Upload", uploadSchema)
