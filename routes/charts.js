const express = require("express")
const Chart = require("../models/Chart")
const Upload = require("../models/Upload")
const { auth } = require("../middleware/auth")

const router = express.Router()


router.post("/", auth, async (req, res) => {
  try {
    const { title, type, xAxis, yAxis, uploadId, config } = req.body

    const upload = await Upload.findOne({
      _id: uploadId,
      userId: req.user._id,
    })

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" })
    }

    const chart = new Chart({
      title,
      type,
      xAxis,
      yAxis,
      uploadId,
      userId: req.user._id,
      config,
    })

    await chart.save()


    upload.charts.push(chart._id)
    await upload.save()

    res.status(201).json({
      message: "Chart created successfully",
      chart,
    })
  } catch (error) {
    res.status(500).json({ message: "Error creating chart", error: error.message })
  }
})


router.get("/", auth, async (req, res) => {
  try {
    const charts = await Chart.find({ userId: req.user._id })
      .populate("uploadId", "originalName")
      .sort({ createdAt: -1 })

    res.json({ charts })
  } catch (error) {
    res.status(500).json({ message: "Error fetching charts", error: error.message })
  }
})


router.get("/:id", auth, async (req, res) => {
  try {
    const chart = await Chart.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("uploadId")

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" })
    }

    res.json({ chart })
  } catch (error) {
    res.status(500).json({ message: "Error fetching chart", error: error.message })
  }
})


router.delete("/:id", auth, async (req, res) => {
  try {
    const chart = await Chart.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" })
    }

    res.json({ message: "Chart deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting chart", error: error.message })
  }
})

module.exports = router
