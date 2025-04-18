// YouTube transcript extraction script
;(() => {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "getYouTubeTranscript") {
        extractYouTubeTranscript()
          .then((transcript) => {
            sendResponse({ transcript: transcript })
          })
          .catch((error) => {
            sendResponse({ error: error.message })
          })
  
        return true // Keep the message channel open for async response
      }
    })
  
    // Function to extract YouTube transcript
    async function extractYouTubeTranscript() {
      // Find the transcript button
      const transcriptButton = Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent.includes("Show transcript"),
      )
  
      if (!transcriptButton) {
        throw new Error("Transcript button not found. Transcript may not be available for this video.")
      }
  
      // Click the transcript button to open the transcript panel
      transcriptButton.click()
  
      // Wait for transcript panel to load
      await new Promise((resolve) => setTimeout(resolve, 1000))
  
      // Find the transcript container
      const transcriptContainer = document.querySelector("ytd-transcript-segment-list-renderer")
  
      if (!transcriptContainer) {
        throw new Error("Transcript container not found. Try again or check if transcripts are available.")
      }
  
      // Extract all transcript segments
      const transcriptSegments = transcriptContainer.querySelectorAll("ytd-transcript-segment-renderer")
  
      if (!transcriptSegments || transcriptSegments.length === 0) {
        throw new Error("No transcript segments found.")
      }
  
      // Combine all segments into a single text
      let fullTranscript = ""
      transcriptSegments.forEach((segment) => {
        const textElement = segment.querySelector(".segment-text")
        if (textElement && textElement.textContent) {
          fullTranscript += textElement.textContent.trim() + " "
        }
      })
  
      return fullTranscript.trim()
    }
  })()
  