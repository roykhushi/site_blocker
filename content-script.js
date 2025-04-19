//using iife so that the content is immediately injected into the page

;(() => {
    chrome.runtime.onMessage.addListener((message, sendResponse) => {
      if (message.action === "getPageContent") {
        const content = extractPageContent();
        sendResponse({ content: content });
      }
      return true;
    })
  
    function extractPageContent() {

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
  
      
      const paragraphs = document.querySelectorAll("p");
      if (paragraphs.length > 0) {
        return Array.from(paragraphs)
          .map((p) => p.textContent.trim())
          .filter((text) => text.length > 20)
          .join("\n\n")
      }
      //else
      return document.body.innerText
    }
  })()
  