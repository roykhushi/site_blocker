document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab")

      // Update active tab button
      tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      // Show active tab content
      tabContents.forEach((content) => {
        content.classList.remove("active")
        if (content.id === `${tabName}-tab`) {
          content.classList.add("active")
        }
      })
    })
  })

  // Website Blocker functionality
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







  // Todo List functionality
  const todoInput = document.getElementById("todo-input")
  const addTodoButton = document.getElementById("add-todo")
  const todoList = document.getElementById("todo-list")
  const todoCount = document.getElementById("todo-count")
  const clearCompletedButton = document.getElementById("clear-completed")
  const filterButtons = document.querySelectorAll(".filter-btn")

  let currentFilter = "all"

  // Load todos when popup opens
  loadTodos()

  // Add todo
  addTodoButton.addEventListener("click", () => {
    addTodo()
  })

  // Allow Enter key to add todo
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo()
    }
  })

  // Filter todos
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.getAttribute("data-filter")

      // Update active filter button
      filterButtons.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      // Reload todos with filter
      loadTodos()
    })
  })

  // Clear completed todos
  clearCompletedButton.addEventListener("click", () => {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const filteredTodos = todos.filter((todo) => !todo.completed)

      chrome.storage.sync.set({ todos: filteredTodos }, () => {
        loadTodos()
      })
    })
  })

  function addTodo() {
    const text = todoInput.value.trim()

    // Basic validation
    if (!text) {
      return
    }

    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []

      // Create new todo
      const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
      }

      // Add to todos array
      todos.push(newTodo)

      // Save updated todos
      chrome.storage.sync.set({ todos: todos }, () => {
        todoInput.value = ""
        loadTodos()
      })
    })
  }

  function loadTodos() {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []

      // Clear current list
      todoList.innerHTML = ""

      // Filter todos based on current filter
      let filteredTodos = todos
      if (currentFilter === "active") {
        filteredTodos = todos.filter((todo) => !todo.completed)
      } else if (currentFilter === "completed") {
        filteredTodos = todos.filter((todo) => todo.completed)
      }

      // If no todos, show message
      if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">No todos yet</li>'
      } else {
        // Sort todos by creation date (newest first)
        filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Render todos
        filteredTodos.forEach((todo) => {
          const li = document.createElement("li")
          li.className = "todo-item"
          li.dataset.id = todo.id

          if (todo.isEditing) {
            li.innerHTML = `
              <input type="text" class="todo-edit-input" value="${todo.text}">
              <div class="todo-actions">
                <button class="todo-save-btn">Save</button>
                <button class="todo-cancel-btn">Cancel</button>
              </div>
            `
          } else {
            li.innerHTML = `
              <div class="todo-checkbox ${todo.completed ? "checked" : ""}">${todo.completed ? "✓" : ""}</div>
              <span class="todo-text ${todo.completed ? "completed" : ""}">${todo.text}</span>
              <div class="todo-actions">
                <button class="todo-edit-btn">Edit</button>
                <button class="todo-delete-btn">Delete</button>
              </div>
            `
          }

          todoList.appendChild(li)
        })

        // Add event listeners to todo items
        addTodoEventListeners()
      }

      // Update todo count
      const activeTodos = todos.filter((todo) => !todo.completed)
      todoCount.textContent = `${activeTodos.length} item${activeTodos.length !== 1 ? "s" : ""} left`
    })
  }

  function addTodoEventListeners() {
    // Toggle todo completion
    document.querySelectorAll(".todo-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id
        toggleTodoCompletion(todoId)
      })
    })

    // Edit todo
    document.querySelectorAll(".todo-edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id
        editTodo(todoId)
      })
    })

    // Delete todo
    document.querySelectorAll(".todo-delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id
        deleteTodo(todoId)
      })
    })

    // Save edited todo
    document.querySelectorAll(".todo-save-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoItem = this.closest(".todo-item")
        const todoId = todoItem.dataset.id
        const newText = todoItem.querySelector(".todo-edit-input").value.trim()
        saveTodoEdit(todoId, newText)
      })
    })

    // Cancel edit
    document.querySelectorAll(".todo-cancel-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id
        cancelTodoEdit(todoId)
      })
    })
  }

  function toggleTodoCompletion(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, completed: !todo.completed }
        }
        return todo
      })

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos()
      })
    })
  }

  function editTodo(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, isEditing: true }
        }
        return { ...todo, isEditing: false }
      })

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos()
      })
    })
  }

  function saveTodoEdit(todoId, newText) {
    if (!newText) {
      return
    }

    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, text: newText, isEditing: false }
        }
        return todo
      })

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos()
      })
    })
  }

  function cancelTodoEdit(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, isEditing: false }
        }
        return todo
      })

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos()
      })
    })
  }

  function deleteTodo(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || []
      const filteredTodos = todos.filter((todo) => todo.id !== todoId)

      chrome.storage.sync.set({ todos: filteredTodos }, () => {
        loadTodos()
      })
    })
  }
})
