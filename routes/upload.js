const express = require("express")
const multer = require("multer")
const XLSX = require("xlsx")
const path = require("path")
const fs = require("fs")
const Upload = require("../models/Upload")
const Chart = require("../models/Chart")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".xlsx", ".xls"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Upload Excel file
router.post("/", auth, upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" })
    }

    const headers = jsonData[0]
    const rows = jsonData.slice(1)

    // Save upload record
    const uploadRecord = new Upload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      userId: req.user._id,
      data: {
        headers,
        rows,
      },
    })

    await uploadRecord.save()

    res.json({
      message: "File uploaded successfully",
      upload: {
        id: uploadRecord._id,
        filename: uploadRecord.originalName,
        headers,
        rowCount: rows.length,
        uploadDate: uploadRecord.createdAt,
      },
    })
  } catch (error) {
    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: "Error processing file", error: error.message })
  }
})

// Get user uploads
router.get("/history", auth, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.user._id })
      .select("originalName createdAt data.headers data.rows fileSize")
      .sort({ createdAt: -1 })

    res.json({ uploads })
  } catch (error) {
    res.status(500).json({ message: "Error fetching uploads", error: error.message })
  }
})

// Get specific upload data
router.get("/:id", auth, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" })
    }

    res.json({ upload })
  } catch (error) {
    res.status(500).json({ message: "Error fetching upload", error: error.message })
  }
})

// Delete upload and associated charts
router.delete("/:id", auth, async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" })
    }

    // Delete associated charts
    await Chart.deleteMany({ uploadId: req.params.id })

    // Delete the file from filesystem
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath)
    }


    await Upload.findByIdAndDelete(req.params.id)

    res.json({ message: "Upload and associated charts deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting upload", error: error.message })
  }
})

module.exports = router
