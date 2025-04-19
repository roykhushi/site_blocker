;(() => {
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "getYouTubeTranscript") {
        extractYouTubeTranscript()
          .then((transcript) => {
            sendResponse({ transcript: transcript })
          })
          .catch((error) => {
            sendResponse({ error: error.message })
          })
  
        return true;
      }
    })
  
    async function extractYouTubeTranscript() {
      const transcriptButton = Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent.includes("Show transcript"),
      )
  
      if (!transcriptButton) {
        throw new Error("Transcript button not found. Transcript may not be available for this video.")
      }
      transcriptButton.click()
  
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const transcriptContainer = document.querySelector("ytd-transcript-segment-list-renderer")
  
      if (!transcriptContainer) {
        throw new Error("Transcript container not found. Try again or check if transcripts are available.")
      }
      const transcriptSegments = transcriptContainer.querySelectorAll("ytd-transcript-segment-renderer")
  
      if (!transcriptSegments || transcriptSegments.length === 0) {
        throw new Error("No transcript segments found.")
      }
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
  