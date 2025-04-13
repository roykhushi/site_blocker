document.addEventListener("DOMContentLoaded", () => {
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
});
