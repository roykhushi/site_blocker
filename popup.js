document.addEventListener("DOMContentLoaded", () => {
  const siteInput = document.getElementById("site-input")
  const addSiteButton = document.getElementById("add-site")
  const blockedList = document.getElementById("blocked-list")
  const favoritesList = document.getElementById("favorites-list")

  // Load blocked sites when popup opens
  loadBlockedSites()

  // Add site to block list
  addSiteButton.addEventListener("click", () => {
    addSite()
  })

  // Allow Enter key to add site
  siteInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addSite()
    }
  })

  function addSite() {
    let url = siteInput.value.trim().toLowerCase()

    // Basic validation
    if (!url) {
      return
    }

    // Remove http://, https://, and www. if present
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "")

    // Get current blocked sites and popular sites
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {}
      const popularSites = result.popularSites || {}

      // Update popular sites count
      if (popularSites[url]) {
        popularSites[url]++
      } else {
        popularSites[url] = 1
      }

      // Add to blocked sites
      blockedSites[url] = popularSites[url]

      // Save updated lists
      chrome.storage.sync.set(
        {
          blockedSites: blockedSites,
          popularSites: popularSites,
        },
        () => {
          siteInput.value = ""
          loadBlockedSites()
        },
      )
    })
  }

  function loadBlockedSites() {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {}
      const popularSites = result.popularSites || {}

      // Clear current lists
      blockedList.innerHTML = ""
      favoritesList.innerHTML = ""

      // If no sites are blocked, show message
      if (Object.keys(blockedSites).length === 0) {
        blockedList.innerHTML = '<li class="empty-message">No websites blocked yet</li>'
      }

      // Create array of blocked sites for sorting
      const blockedSitesArray = Object.entries(blockedSites).map(([site, count]) => ({
        site,
        count,
        isBlocked: true,
      }))

      // Sort by site name for blocked list
      blockedSitesArray.sort((a, b) => a.site.localeCompare(b.site))

      // Render blocked sites
      blockedSitesArray.forEach(({ site, count }) => {
        const li = document.createElement("li")
        li.innerHTML = `
          <span class="site-name">${site}<span class="count-badge">${count}</span></span>
          <button class="unblock-btn" data-site="${site}">Unblock</button>
        `
        blockedList.appendChild(li)
      })

      // Create array of popular sites for favorites
      const popularSitesArray = Object.entries(popularSites).map(([site, count]) => ({
        site,
        count,
        isBlocked: !!blockedSites[site],
      }))

      // Sort by count for favorites (descending)
      popularSitesArray.sort((a, b) => b.count - a.count)

      // Take top 5 for favorites
      const favorites = popularSitesArray.slice(0, 5)

      // If no popular sites, show message
      if (favorites.length === 0) {
        favoritesList.innerHTML = '<li class="empty-message">No favorites yet</li>'
        return
      }

      // Render favorites
      favorites.forEach(({ site, count, isBlocked }) => {
        const li = document.createElement("li")
        li.className = isBlocked ? "blocked" : "unblocked"

        li.innerHTML = `
          <span class="site-name">${site}<span class="count-badge">${count}</span></span>
          ${
            isBlocked
              ? `<button class="unblock-btn" data-site="${site}">Unblock</button>`
              : `<button class="block-btn" data-site="${site}">Block</button>`
          }
        `
        favoritesList.appendChild(li)
      })

      // Add event listeners to unblock buttons
      document.querySelectorAll(".unblock-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const site = this.getAttribute("data-site")
          unblockSite(site)
        })
      })

      // Add event listeners to block buttons
      document.querySelectorAll(".block-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const site = this.getAttribute("data-site")
          blockSite(site)
        })
      })
    })
  }

  function unblockSite(site) {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {}
      const popularSites = result.popularSites || {}

      // Remove site from blocked list
      if (blockedSites[site]) {
        delete blockedSites[site]

        // Save updated list
        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
          // Force rule update by sending a message to the background script
          chrome.runtime.sendMessage({ action: "updateRules" })
          loadBlockedSites()
        })
      }
    })
  }

  function blockSite(site) {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {}
      const popularSites = result.popularSites || {}

      // Add site to blocked list
      blockedSites[site] = popularSites[site] || 1

      // Save updated list
      chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
        // Force rule update by sending a message to the background script
        chrome.runtime.sendMessage({ action: "updateRules" })
        loadBlockedSites()
      })
    })
  }
})

