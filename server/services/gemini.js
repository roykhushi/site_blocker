const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const getModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
}

/**
 * Generate a summary of the provided content using Gemini 2.0 Flash
 * @param {string} content - The content to summarize
 * @param {string} mode - The summarization mode (tldr, bullets, todos, highlights, casual, professional)
 * @returns {Promise<string>} - The generated summary
 */
const generateSummary = async (content, mode) => {
  try {
    const model = getModel()

    let prompt = ""

    switch (mode) {
      case "tldr":
        prompt = `Provide a concise TL;DR summary of the following content:\n\n${content}`
        break
      case "bullets":
        prompt = `Summarize the following content in bullet points:\n\n${content}`
        break
      case "todos":
        prompt = `Extract actionable to-do items from the following content:\n\n${content}`
        break
      case "highlights":
        prompt = `Extract the key highlights from the following content:\n\n${content}`
        break
      case "casual":
        prompt = `Provide a casual, conversational summary of the following content:\n\n${content}`
        break
      case "professional":
        prompt = `Provide a professional, formal summary of the following content:\n\n${content}`
        break
      default:
        prompt = `Summarize the following content:\n\n${content}`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error in Gemini API call:", error)
    throw new Error("Failed to generate summary with Gemini API")
  }
}

module.exports = {
  generateSummary,
}
