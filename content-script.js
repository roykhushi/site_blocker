//using iife so that the content is immediately injected into the page

// Content script for extracting page content
;(() => {
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sendResponse) => {
      if (message.action === "getPageContent") {
        // Extract the main content from the page
        const content = extractPageContent();
        sendResponse({ content: content });
      }
      return true;
    })
  
    // Function to extract the main content from the page
    function extractPageContent() {
      // Try to find the main content
      // This is a simple implementation - in a real extension, you'd want more sophisticated content extraction
  
      // First, try to find article or main content elements
      const mainContentSelectors = [
        "article",
        "main",
        ".article-content",
        ".post-content",
        ".entry-content",
        "#content",
        ".content",
      ]
  
      for (const selector of mainContentSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent.trim().length > 100) {
          return element.textContent.trim();
        }
      }
  
      // If no main content found, get all paragraph text
      const paragraphs = document.querySelectorAll("p");
      if (paragraphs.length > 0) {
        return Array.from(paragraphs)
          .map((p) => p.textContent.trim())
          .filter((text) => text.length > 20) // Filter out very short paragraphs
          .join("\n\n")
      }
  
      // Fallback to body text
      return document.body.innerText
    }
  })()
  