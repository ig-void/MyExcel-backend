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

// CORS Configuration - IMPORTANT: This fixes your error
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local development
    "http://localhost:5173", // Vite default port
    "https://your-app.vercel.app", // Your Vercel deployment
    "https://myexcel-frontend.vercel.app", // Replace with your actual Vercel URL
  ],
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
}

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions))

// Handle preflight requests
app.options("*", cors(corsOptions))

// Other middleware
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
  res.json({
    message: "Server is running!",
    cors: "enabled",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`CORS enabled for origins: ${corsOptions.origin.join(", ")}`)
})
