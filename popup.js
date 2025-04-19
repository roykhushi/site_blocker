document.addEventListener("DOMContentLoaded", () => {

  const themeToggle = document.getElementById("theme-toggle-checkbox")

  chrome.storage.sync.get(["darkMode"], (result) => {
    if (result.darkMode) {
      document.body.setAttribute("data-theme", "dark")
      themeToggle.checked = true
    } else {
      document.body.removeAttribute("data-theme")
      themeToggle.checked = false
    }
  })

  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.body.setAttribute("data-theme", "dark")
      chrome.storage.sync.set({ darkMode: true })
    } else {
      document.body.removeAttribute("data-theme")
      chrome.storage.sync.set({ darkMode: false })
    }
  })



  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${tabName}-tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  const siteInput = document.getElementById("site-input");
  const addSiteButton = document.getElementById("add-site");
  const blockedList = document.getElementById("blocked-list");
  const favoritesList = document.getElementById("favorites-list");

  loadBlockedSites();

  addSiteButton.addEventListener("click", () => {
    addSite();
  });

  siteInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addSite();
    }
  });

  function addSite() {
    let url = siteInput.value.trim().toLowerCase();

    if (!url) {
      return;
    }
    url = url.replace(/^(https?:\/\/)?(www\.)?/, "");

    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {};
      const popularSites = result.popularSites || {};

      if (popularSites[url]) {
        popularSites[url]++;
      } else {
        popularSites[url] = 1;
      }

      blockedSites[url] = popularSites[url];

      chrome.storage.sync.set(
        {
          blockedSites: blockedSites,
          popularSites: popularSites,
        },
        () => {
          siteInput.value = "";
          loadBlockedSites();
        }
      );
    });
  }

  function loadBlockedSites() {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {};
      const popularSites = result.popularSites || {};

      blockedList.innerHTML = "";
      favoritesList.innerHTML = "";

      if (Object.keys(blockedSites).length === 0) {
        blockedList.innerHTML =
          '<li class="empty-message">No websites blocked yet</li>';
      }
      const blockedSitesArray = Object.entries(blockedSites).map(
        ([site, count]) => ({
          site,
          count,
          isBlocked: true,
        })
      );
      blockedSitesArray.sort((a, b) => a.site.localeCompare(b.site));

      blockedSitesArray.forEach(({ site, count }) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="site-name">${site}<span class="count-badge">${count}</span></span>
          <button class="unblock-btn" data-site="${site}">Unblock</button>
        `;
        blockedList.appendChild(li);
      });

      const popularSitesArray = Object.entries(popularSites).map(
        ([site, count]) => ({
          site,
          count,
          isBlocked: !!blockedSites[site],
        })
      );
      popularSitesArray.sort((a, b) => b.count - a.count);

      const favorites = popularSitesArray.slice(0, 5);

      if (favorites.length === 0) {
        favoritesList.innerHTML =
          '<li class="empty-message">No favorites yet</li>';
        return;
      }

      favorites.forEach(({ site, count, isBlocked }) => {
        const li = document.createElement("li");
        li.className = isBlocked ? "blocked" : "unblocked";

        li.innerHTML = `
          <span class="site-name">${site}<span class="count-badge">${count}</span></span>
          ${
            isBlocked
              ? `<button class="unblock-btn" data-site="${site}">Unblock</button>`
              : `<button class="block-btn" data-site="${site}">Block</button>`
          }
        `;
        favoritesList.appendChild(li);
      });

      document.querySelectorAll(".unblock-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const site = this.getAttribute("data-site");
          unblockSite(site);
        });
      });

      document.querySelectorAll(".block-btn").forEach((button) => {
        button.addEventListener("click", function () {
          const site = this.getAttribute("data-site");
          blockSite(site);
        });
      });
    });
  }

  function unblockSite(site) {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {};
      const popularSites = result.popularSites || {};

      if (blockedSites[site]) {
        delete blockedSites[site];

        chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
          chrome.runtime.sendMessage({ action: "updateRules" });
          loadBlockedSites();
        });
      }
    });
  }

  function blockSite(site) {
    chrome.storage.sync.get(["blockedSites", "popularSites"], (result) => {
      const blockedSites = result.blockedSites || {};
      const popularSites = result.popularSites || {};

      blockedSites[site] = popularSites[site] || 1;

      chrome.storage.sync.set({ blockedSites: blockedSites }, () => {
        chrome.runtime.sendMessage({ action: "updateRules" });
        loadBlockedSites();
      });
    });
  }

  //todos part

  const todoInput = document.getElementById("todo-input");
  const addTodoButton = document.getElementById("add-todo");
  const todoList = document.getElementById("todo-list");
  const todoCount = document.getElementById("todo-count");
  const clearCompletedButton = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let currentFilter = "all";

  loadTodos();

  addTodoButton.addEventListener("click", () => {
    addTodo();
  });

  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.getAttribute("data-filter");

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadTodos();
    });
  });

  clearCompletedButton.addEventListener("click", () => {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const filteredTodos = todos.filter((todo) => !todo.completed);

      chrome.storage.sync.set({ todos: filteredTodos }, () => {
        loadTodos();
      });
    });
  });

  function addTodo() {
    const text = todoInput.value.trim();

    if (!text) {
      return;
    }

    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      todos.push(newTodo);

      chrome.storage.sync.set({ todos: todos }, () => {
        todoInput.value = "";
        loadTodos();
      });
    });
  }

  function loadTodos() {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      todoList.innerHTML = "";
      let filteredTodos = todos;
      if (currentFilter === "active") {
        filteredTodos = todos.filter((todo) => !todo.completed);
      } else if (currentFilter === "completed") {
        filteredTodos = todos.filter((todo) => todo.completed);
      }

      if (filteredTodos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">No todos yet</li>';
      } else {
        filteredTodos.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        filteredTodos.forEach((todo) => {
          const li = document.createElement("li");
          li.className = "todo-item";
          li.dataset.id = todo.id;

          if (todo.isEditing) {
            li.innerHTML = `
              <input type="text" class="todo-edit-input" value="${todo.text}">
              <div class="todo-actions">
                <button class="todo-save-btn">Save</button>
                <button class="todo-cancel-btn">Cancel</button>
              </div>
            `;
          } else {
            li.innerHTML = `
              <div class="todo-checkbox ${todo.completed ? "checked" : ""}">${
              todo.completed ? "✓" : ""
            }</div>
              <span class="todo-text ${todo.completed ? "completed" : ""}">${
              todo.text
            }</span>
              <div class="todo-actions">
                <button class="todo-edit-btn">Edit</button>
                <button class="todo-delete-btn">Delete</button>
              </div>
            `;
          }

          todoList.appendChild(li);
        });

        addTodoEventListeners();
      }

      const activeTodos = todos.filter((todo) => !todo.completed);
      todoCount.textContent = `${activeTodos.length} item${
        activeTodos.length !== 1 ? "s" : ""
      } left`;
    });
  }

  function addTodoEventListeners() {
    document.querySelectorAll(".todo-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id;
        toggleTodoCompletion(todoId);
      });
    });

    document.querySelectorAll(".todo-edit-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id;
        editTodo(todoId);
      });
    });

    document.querySelectorAll(".todo-delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id;
        deleteTodo(todoId);
      });
    });

    document.querySelectorAll(".todo-save-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoItem = this.closest(".todo-item");
        const todoId = todoItem.dataset.id;
        const newText = todoItem.querySelector(".todo-edit-input").value.trim();
        saveTodoEdit(todoId, newText);
      });
    });

    document.querySelectorAll(".todo-cancel-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const todoId = this.closest(".todo-item").dataset.id;
        cancelTodoEdit(todoId);
      });
    });
  }

  function toggleTodoCompletion(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      });

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos();
      });
    });
  }

  function editTodo(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, isEditing: true };
        }
        return { ...todo, isEditing: false };
      });

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos();
      });
    });
  }

  function saveTodoEdit(todoId, newText) {
    if (!newText) {
      return;
    }

    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, text: newText, isEditing: false };
        }
        return todo;
      });

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos();
      });
    });
  }

  function cancelTodoEdit(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const updatedTodos = todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, isEditing: false };
        }
        return todo;
      });

      chrome.storage.sync.set({ todos: updatedTodos }, () => {
        loadTodos();
      });
    });
  }

  function deleteTodo(todoId) {
    chrome.storage.sync.get(["todos"], (result) => {
      const todos = result.todos || [];
      const filteredTodos = todos.filter((todo) => todo.id !== todoId);

      chrome.storage.sync.set({ todos: filteredTodos }, () => {
        loadTodos();
      });
    });
  }

  // ai part
  const contentInput = document.getElementById("content-input")
  const summaryMode = document.getElementById("summary-mode")
  const fetchContentToggle = document.getElementById("fetch-content-toggle")
  const summarizeBtn = document.getElementById("summarize-btn")
  const summarizerResult = document.getElementById("summarizer-result")
  const summaryContent = document.getElementById("summary-content")
  const summarizerLoading = document.getElementById("summarizer-loading")
  const summarizerError = document.getElementById("summarizer-error")
  const retryBtn = document.getElementById("retry-btn")
  const copySummaryBtn = document.getElementById("copy-summary")
  const shareSummaryBtn = document.getElementById("share-summary")
  const productivityTip = document.getElementById("productivity-tip");

  const BACKEND_API_URL = "https://site-blocker-b4xe.onrender.com/api/summarize"

 
  loadRandomProductivityTip();

  fetchContentToggle.addEventListener("change", () => {
    if (fetchContentToggle.checked) {
      contentInput.disabled = true
      contentInput.placeholder = "Content will be fetched from the current page..."
    } else {
      contentInput.disabled = false
      contentInput.placeholder = "Paste or type content to summarize..."
    }
  })

  summarizeBtn.addEventListener("click", () => {
    summarizerResult.classList.add("hidden");
    summarizerError.classList.add("hidden");

    summarizerLoading.classList.remove("hidden");

    if (fetchContentToggle.checked) {
      fetchCurrentPageContent()
        .then((content) => {
          if (content) {
            generateSummary(content)
          } else {
            showError("Could not fetch content from the current page.")
          }
        })
        .catch((error) => {
          showError("Error fetching content: " + error.message)
        })
    } else {
      const content = contentInput.value.trim()
      if (!content) {
        showError("Please enter some content to summarize.")
        return
      }

      generateSummary(content)
    }
  })

  retryBtn.addEventListener("click", () => {
    summarizerError.classList.add("hidden")
    summarizeBtn.click()
  })

  copySummaryBtn.addEventListener("click", () => {
    const summaryText = summaryContent.textContent
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const originalText = copySummaryBtn.innerHTML
        copySummaryBtn.innerHTML = '<span class="icon">✓</span>'
        setTimeout(() => {
          copySummaryBtn.innerHTML = originalText
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  })

  shareSummaryBtn.addEventListener("click", () => {
    const summaryText = summaryContent.textContent

    // web share api available ?
    if (navigator.share) {
      navigator
        .share({
          title: "Summary from Smart Summarizer",
          text: summaryText,
        })
        .catch((err) => {
          console.error("Failed to share: ", err)
        })
    } else {
      navigator.clipboard
        .writeText(summaryText)
        .then(() => {
          alert("Summary copied to clipboard (sharing not supported in this browser)")
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err)
        })
    }
  })

  async function fetchCurrentPageContent() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          reject(new Error("No active tab found"))
          return
        }

        const activeTab = tabs[0]

        if (activeTab.url.includes("youtube.com/watch")) {
          chrome.tabs.sendMessage(activeTab.id, { action: "getYouTubeTranscript" }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error("Could not get YouTube transcript. Make sure you're on a video page."))
              return
            }

            if (response && response.transcript) {
              resolve(response.transcript)
            } else {
              reject(new Error("Could not get YouTube transcript"))
            }
          })
        } else {
          chrome.tabs.sendMessage(activeTab.id, { action: "getPageContent" }, (response) => {
            if (chrome.runtime.lastError) {
              chrome.scripting.executeScript(
                {
                  target: { tabId: activeTab.id },
                  function: () => {
                    const content = document.body.innerText
                    return content
                  },
                },
                (results) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error("Could not access page content"))
                    return
                  }

                  if (results && results[0] && results[0].result) {
                    resolve(results[0].result)
                  } else {
                    reject(new Error("Could not extract page content"))
                  }
                },
              )
            } else if (response && response.content) {
              resolve(response.content)
            } else {
              reject(new Error("Could not get page content"))
            }
          })
        }
      })
    })
  }

  async function generateSummary(content) {
    try {
      const mode = summaryMode.value

      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          mode: mode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate summary")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.message || "Failed to generate summary")
      }
      summaryContent.innerHTML = formatSummary(data.summary, mode)

      summarizerLoading.classList.add("hidden")
      summarizerResult.classList.remove("hidden")
    } catch (error) {
      showError("Failed to generate summary: " + error.message)
    }
  }

  function formatSummary(summary, mode) {
    switch (mode) {
      case "bullets":
      case "todos":
        if (!summary.includes("<li>")) {
          const lines = summary.split("\n").filter((line) => line.trim());
          const listItems = lines.map((line) => {
            let cleanLine = line.replace(/^[\s•\-\d.)]+\s*/, "");
  
            cleanLine = cleanLine.replace(/^(.+?):\s*/, "<strong>$1:</strong> ");
  
            cleanLine = cleanLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
            return `<li style="margin-bottom: 0.5em;">${cleanLine}</li>`;
          });
          return `<ul style="padding-left: 1.5em; list-style-type: disc;">${listItems.join("")}</ul>`;
        }
  
        summary = summary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        return summary;
  
      case "highlights":
        const parts = summary.split("\n");
        if (parts.length > 1) {
          const title = `<strong>${parts[0]}</strong>`;
          const rest = parts.slice(1).join("<br>");
          return `${title}<br>${rest}`;
        }
        return summary;
  
      default:
        return summary.replace(/\n/g, "<br>");
    }
  }
  

  function showError(message) {
    const errorMessage = document.querySelector(".error-message")
    errorMessage.textContent = message

    summarizerLoading.classList.add("hidden")
    summarizerError.classList.remove("hidden")
  }

 
  function loadRandomProductivityTip() {
    const tips = [
      "Use the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break.",
      "Try the 2-minute rule: If a task takes less than 2 minutes, do it now.",
      "Plan tomorrow's tasks at the end of each workday.",
      "Use the Eisenhower Matrix to prioritize tasks by urgency and importance.",
      "Block distracting websites during your focus time.",
      "Practice the 80/20 rule: 80% of results come from 20% of efforts.",
      "Schedule your most challenging tasks during your peak energy hours.",
      "Take short breaks to maintain focus and prevent burnout.",
      "Use time blocking to dedicate specific hours to specific tasks.",
      "Keep a distraction list nearby to jot down thoughts that interrupt your focus.",
    ]

    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    productivityTip.textContent = randomTip
  }
});
