const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const summarizeRoutes = require("./routes/summarize.js")

dotenv.config();

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors({
  origin: "*",//after publishing chrome ext
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}
))
app.use(express.json({ limit: "1mb" }))

app.use("/api", summarizeRoutes)

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
