// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with empty blocked sites and popular sites objects
  chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
    if (!result.blockedSites) {
      chrome.storage.sync.set({ blockedSites: {} })
    }
    if (!result.popularSites) {
      chrome.storage.sync.set({ popularSites: {} })
    }
  })

  // Clear any existing rules
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [...Array(1000).keys()], // Remove rules with IDs 0-999
  })
})

// Listen for changes to blocked sites
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedSites) {
    updateBlockRules(changes.blockedSites.newValue)
    clearBrowserCache()
  }
})

// Update blocking rules based on blocked sites
function updateBlockRules(blockedSites) {
  // Get all sites from the blockedSites object
  const sites = Object.keys(blockedSites)

  // First, remove all existing rules
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIdsToRemove = existingRules.map((rule) => rule.id)

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: ruleIdsToRemove,
      },
      () => {
        // Only add new rules if there are sites to block
        if (sites.length > 0) {
          // Create new rules for each blocked site
          const rules = sites.map((site, index) => {
            return {
              id: index + 1, // Rule IDs start at 1
              priority: 1,
              action: {
                type: "redirect",
                redirect: {
                  url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(site),
                },
              },
              condition: {
                urlFilter: site,
                resourceTypes: ["main_frame"],
              },
            }
          })

          // Add the new rules
          chrome.declarativeNetRequest.updateDynamicRules(
            {
              addRules: rules,
            },
            () => {
              clearBrowserCache()
            },
          )
        } else {
          clearBrowserCache()
        }
      },
    )
  })
}

// Listen for tab updates to handle blocked sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    try {
      // Parse the URL to get the hostname
      const hostname = new URL(tab.url).hostname.replace(/^www\./, "")

      // Get blocked sites from storage
      chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
        const blockedSites = result.blockedSites || {}
        const popularSites = result.popularSites || {}

        // Check if the hostname or any part of it is in the blocked list
        for (const site in blockedSites) {
          if (hostname === site || hostname.endsWith("." + site)) {
            // Redirect to blocked page
            chrome.tabs.update(tabId, {
              url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(hostname),
            })
            return
          }
        }
      })
    } catch (e) {
      // Invalid URL, do nothing
      console.error("Error parsing URL:", e)
    }
  }
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateRules") {
    chrome.storage.sync.get(["blockedSites"], (result) => {
      updateBlockRules(result.blockedSites || {})
    })
  }
})

// Clear browser cache for better rule enforcement
function clearBrowserCache() {
  if (chrome.browsingData) {
    chrome.browsingData.removeCache({
      since: 0,
    })
  }
}

