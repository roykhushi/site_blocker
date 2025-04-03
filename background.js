chrome.runtime.onInstalled.addListener(() => {
    
    chrome.storage.sync.get(["blockedSites"], (result) => {
      if (!result.blockedSites) {
        chrome.storage.sync.set({ blockedSites: {} })
      }
    })
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [...Array(1000).keys()], 
    })
  })
  
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.blockedSites) {
      updateBlockRules(changes.blockedSites.newValue)
      clearBrowserCache()
    }
  })
  

  function updateBlockRules(blockedSites) {
    const sites = Object.keys(blockedSites)

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const ruleIdsToRemove = existingRules.map((rule) => rule.id)
  
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
                    url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(site),
                  },
                },
                condition: {
                  urlFilter: site,
                  resourceTypes: ["main_frame"],
                },
              }
            })
  
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
  
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading" && tab.url) {
      try {
        
        const hostname = new URL(tab.url).hostname.replace(/^www\./, "")
  
        chrome.storage.sync.get(["blockedSites"], (result) => {
          const blockedSites = result.blockedSites || {}
  
          for (const site in blockedSites) {
            if (hostname === site || hostname.endsWith("." + site)) {
             
              chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL("blocked.html") + "?site=" + encodeURIComponent(hostname),
              })
              return
            }
          }
        })
      } catch (e) {
        
        console.error("Error parsing URL:", e)
      }
    }
  })
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateRules") {
      chrome.storage.sync.get(["blockedSites"], (result) => {
        updateBlockRules(result.blockedSites || {})
      })
    }
  })
  
  function clearBrowserCache() {
    if (chrome.browsingData) {
      chrome.browsingData.removeCache({
        since: 0,
      })
    }
  }
  
  