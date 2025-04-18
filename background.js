chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["blockedSites", "popularSites", "todos"],
    (result) => {
      if (!result.blockedSites) {
        chrome.storage.sync.set({ blockedSites: {} });
      }
      if (!result.popularSites) {
        chrome.storage.sync.set({ popularSites: {} });
      }
      if (!result.todos) {
        chrome.storage.sync.set({ todos: [] });
      }
    }
  );

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [...Array(1000).keys()],
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedSites) {
    updateBlockRules(changes.blockedSites.newValue);
    clearBrowserCache();
  }
});

function updateBlockRules(blockedSites) {
  const sites = Object.keys(blockedSites);

  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleIdsToRemove = existingRules.map((rule) => rule.id);

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: ruleIdsToRemove,
      },
      () => {
        if (sites.length > 0) {
          const rules = sites.map((site, index) => {
            return {
              id: index + 1,
              priority: 1,
              action: {
                type: "redirect",
                redirect: {
                  url:
                    chrome.runtime.getURL("blocked.html") +
                    "?site=" +
                    encodeURIComponent(site),
                },
              },
              condition: {
                urlFilter: site,
                resourceTypes: ["main_frame"],
              },
            };
          });

          chrome.declarativeNetRequest.updateDynamicRules(
            {
              addRules: rules,
            },
            () => {
              clearBrowserCache();
            }
          );
        } else {
          clearBrowserCache();
        }
      }
    );
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    try {
      const hostname = new URL(tab.url).hostname.replace(/^www\./, "");

      chrome.storage.sync.get(["blockedSites"], (result) => {
        const blockedSites = result.blockedSites || {};
        // const popularSites = result.popularSites || {}

        for (const site in blockedSites) {
          if (hostname === site || hostname.endsWith("." + site)) {
            chrome.tabs.update(tabId, {
              url:
                chrome.runtime.getURL("blocked.html") +
                "?site=" +
                encodeURIComponent(hostname),
            });
            return;
          }
        }
      });
    } catch (e) {
      alert("Invalid URL!");
      console.error("Error parsing URL:", e);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateRules") {
    chrome.storage.sync.get(["blockedSites"], (result) => {
      updateBlockRules(result.blockedSites || {});
    });
  }
  else if (message.action === "getPageContent") {
    // Handle content fetching for summarizer
    if (sender.tab) {
      // This is from a content script, not from our popup
      sendResponse({ success: true })
    } else {
      // This is from our popup, we'll handle it in the tabs API
      sendResponse({ success: true })
    }
  }
  return true
});

var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var oneWeekAgo = new Date().getTime() - millisecondsPerWeek;

function clearBrowserCache() {
  if (chrome.browsingData) {
    chrome.browsingData.removeCache({
      since: oneWeekAgo,
    });
  }
}

// Content script injection for page summarization
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // Check if it's a YouTube page
    if (tab.url.includes("youtube.com/watch")) {
      // Inject YouTube transcript extraction script
      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          files: ["youtube-transcript.js"],
        })
        .catch((err) => console.error("Failed to inject YouTube script:", err))
    }
  }
})
