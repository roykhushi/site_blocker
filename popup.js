document.addEventListener("DOMContentLoaded", () => {
    const siteInput = document.getElementById("site-input")
    const addSiteButton = document.getElementById("add-site")
    const blockedList = document.getElementById("blocked-list")
    const favoritesList = document.getElementById("favorites-list")
  
    
    loadBlockedSites()
  
    addSiteButton.addEventListener("click", () => {
      addSite()
    })
  
    siteInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addSite()
      }
    })
  
    function addSite() {
      let url = siteInput.value.trim().toLowerCase()

      if (!url) {
        return
      }
  
      // removing http://, https://, and www. 
      url = url.replace(/^(https?:\/\/)?(www\.)?/, "")
  
      
      chrome.storage.sync.get(["blockedSites"], (result) => {// current blocked sites
        const blockedSites = result.blockedSites || {}
  
        if (blockedSites[url]) {
          blockedSites[url]++
        } else {
          blockedSites[url] = 1
        }
        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
          siteInput.value = ""
          loadBlockedSites()
        })
      })
    }
  
    function loadBlockedSites() {
      chrome.storage.sync.get(["blockedSites"], (result) => {
        const blockedSites = result.blockedSites || {}
  
        blockedList.innerHTML = ""
        favoritesList.innerHTML = ""
  
        if (Object.keys(blockedSites).length === 0) {
          blockedList.innerHTML = '<li class="empty-message">No websites blocked yet</li>'
          favoritesList.innerHTML = '<li class="empty-message">No favorites yet</li>'
          return
        }
  
        const sitesArray = Object.entries(blockedSites).map(([site, count]) => ({
          site,
          count,
        }))
  
        sitesArray.sort((a, b) => a.site.localeCompare(b.site))
  
        sitesArray.forEach(({ site, count }) => {
          const li = document.createElement("li")
          li.innerHTML = `
            <span class="site-name">${site}<span class="count-badge">${count}</span></span>
            <button class="unblock-btn" data-site="${site}">Unblock</button>
          `
          blockedList.appendChild(li)
        })
  
        sitesArray.sort((a, b) => b.count - a.count)
  
        const favorites = sitesArray.slice(0, 5)
  
        favorites.forEach(({ site, count }) => {
          const li = document.createElement("li")
          li.innerHTML = `
            <span class="site-name">${site}<span class="count-badge">${count}</span></span>
            <button class="unblock-btn" data-site="${site}">Unblock</button>
          `
          favoritesList.appendChild(li)
        })
  
        document.querySelectorAll(".unblock-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const site = this.getAttribute("data-site")
            unblockSite(site)
          })
        })
      })
    }
  
    function unblockSite(site) {
      chrome.storage.sync.get(["blockedSites"], (result) => {
        const blockedSites = result.blockedSites || {}
  
        if (blockedSites[site]) {
          delete blockedSites[site]
  
       
          chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
            
            chrome.runtime.sendMessage({ action: "updateRules" })
            loadBlockedSites()
          })
        }
      })
    }
  })
  
  