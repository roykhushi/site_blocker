# FocusFlow Chrome Extension

A powerful and user-friendly Chrome extension to help you stay productive by blocking distracting websites, managing your tasks with a built-in todo list, and summarizing content with AI.

---

## Installation Guide

1. **Download the Extension**
   - Create a new folder on your computer for the extension.
   - Save all the extension files in that folder:
     ```
     manifest.json
     background.js
     popup.html
     popup.js
     styles.css
     blocked.html
     blocked.js
     blocked.css
     content-script.js
     youtube-transcript.js
     ```
   - (For AI summarizer) The backend server files are in the `server/` folder.

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select your extension folder
   - Look for the extension icon in your toolbar

---

## Features

### Website Blocker
- Block distracting websites by domain (e.g., `facebook.com`)
- Subdomain support (blocks `www.facebook.com`, `m.facebook.com`, etc.)
- Manage blocked sites: view, unblock, and see block frequency

### Favorites Section
- Tracks your most frequently blocked sites
- Shows top 5 most blocked sites for quick access

### Todo List
- Add, edit, delete, and complete tasks
- Filter by All, Active, or Completed
- Clean, intuitive interface

### AI Summarizer
- Summarize any text, web page, or YouTube transcript using Gemini 2.0 Flash
- Multiple summary modes: TL;DR, Bullet Points, Actionable To-Do Items, Highlights, Casual, Professional
- Copy/share summaries easily

### Productivity Tips
- Get a random productivity tip every time you open the summarizer

### Blocking Mechanism
- Custom blocking page with clear messaging
- "Go Back" button for easy navigation

---

## Technical Details

- **Frontend:** Chrome extension (HTML, CSS, JS)
- **Backend:** Node.js Express server (for AI summarization)
- **AI:** Gemini 2.0 Flash API (via backend)
- **Storage:** Chrome Storage Sync API for user data
- **Permissions:** Tabs, storage, scripting, notifications, alarms, clipboard, etc.

---

## File Structure

```
site_blocker/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── styles.css
├── blocked.html
├── blocked.js
├── blocked.css
├── content-script.js
├── youtube-transcript.js
├── server/
│   ├── server.js
│   ├── routes/
│   │   └── summarize.js
│   ├── services/
│   │   └── gemini.js
│   ├── package.json
│   └── .env
```

---

## Security & Performance

- Secure site storage and rule updates
- Minimal performance impact
- Rate limiting on AI summarizer backend
- Protected extension resources

---

## Contributing

We welcome contributions! Open a PR to get started.

---

## Acknowledgements

- <a href="https://www.flaticon.com/free-icons/block" title="block icons">Block icons created by Those Icons - Flaticon</a>
- Gemini API by Google

---

**Made with ❤️ by Khushi**