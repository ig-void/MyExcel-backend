const express = require("express")
const User = require("../models/User")
const Upload = require("../models/Upload")
const Chart = require("../models/Chart")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").populate("uploads", "originalName createdAt")

    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
})

// Get platform statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalUploads = await Upload.countDocuments()
    const totalCharts = await Chart.countDocuments()

    const recentUploads = await Upload.find().populate("userId", "username email").sort({ createdAt: -1 }).limit(10)

    res.json({
      stats: {
        totalUsers,
        totalUploads,
        totalCharts,
      },
      recentUploads,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message })
  }
})

// Delete user
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin user" })
    }

    // Delete user's uploads and charts
    await Upload.deleteMany({ userId: req.params.id })
    await Chart.deleteMany({ userId: req.params.id })
    await User.findByIdAndDelete(req.params.id)

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message })
  }
})

module.exports = router
