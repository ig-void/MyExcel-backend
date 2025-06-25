const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const multer = require("multer")
const path = require("path")

// Import routes
const authRoutes = require("./routes/auth")
const uploadRoutes = require("./routes/upload")
const chartRoutes = require("./routes/charts")
const adminRoutes = require("./routes/admin")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"))

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/excel-analytics", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Connected to MongoDB")
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/charts", chartRoutes)
app.use("/api/admin", adminRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
