const express = require("express")
const router = express.Router()
const { generateSummary } = require("../services/gemini.js")


const requestCounts = {}
const RATE_LIMIT = 10 
const RATE_WINDOW = 60 * 1000 

const rateLimiter = (req, res, next) => {
  const ip = req.ip
  const now = Date.now()

  if (!requestCounts[ip] || now - requestCounts[ip].timestamp > RATE_WINDOW) {
    requestCounts[ip] = {
      count: 0,
      timestamp: now,
    }
  }

  requestCounts[ip].count++


  if (requestCounts[ip].count > RATE_LIMIT) {
    return res.status(429).json({
      error: true,
      message: "Rate limit exceeded. Please try again later.",
    })
  }

  next();
}

router.post("/summarize", rateLimiter, async (req, res) => {
  try {
    console.log(`inside summary`);
    const { content, mode } = req.body

    if (!content) {
      return res.status(400).json({
        error: true,
        message: "Content is required!",
      });
    }

    if(typeof content !== "string"){
        return res.status(400).json({
            error: true,
            message: "Invalid form of content, please provide textual content!"
        })
    }

    if (!mode || typeof mode !== "string") {
      return res.status(400).json({
        error: true,
        message: "A Valid mode is required!",
      });
    }

    if (content.length > 25000) {
      return res.status(400).json({
        error: true,
        message: "Content is too long. Please limit to 25,000 characters.",
      })
    }

    const summary = await generateSummary(content, mode)

    res.status(200).json({
      error: false,
      summary,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    res.status(500).json({
      error: true,
      message: "Failed to generate summary",
    })
  }
})

module.exports = router
