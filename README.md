# Website Blocker Chrome Extension

A powerful and user-friendly Chrome extension that helps you manage your browsing habits by blocking distracting websites and managing your tasks with a built-in todo list.

## Installation Guide

1. **Download the Extension**
   - Create a new folder on your computer for the extension
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
     ```

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select your extension folder
   - Look for the extension icon in your toolbar

## Features

### 🚫 Block Websites
- Enter a domain name (e.g., `facebook.com`)
- Click "Block" or press Enter
- Works without `http://` or `www.` prefixes

###  Manage Blocked Sites
- View all blocked sites
- Track blocking frequency
- One-click unblock
- Clean interface

###  Favorites Section
- Auto-tracks frequent blocks
- Shows top 5 blocked sites
- Quick management options
- Easy unblocking

###  Todo List
- Add tasks to your todo list
- Mark tasks as complete
- Filter tasks by All, Active, or Completed
- Edit and delete tasks

###  Blocking Mechanism
- Custom blocking page
- Subdomain support
- Back navigation
- Quick unblock option

## Technical Details

### Core Technologies
```
- Chrome Extension APIs
- Storage Sync API
- Declarative Net Request API
- Browser Data API
```

### Security
- Secure site storage
- Rule update cache clearing
- Protected resources

### Performance
- Light footprint
- Minimal impact
- Real-time updates

##  File Structure
```
site_blocker/
├── manifest.json    # Extension configuration
├── background.js    # Service worker (manages blocking rules)
├── popup.html      # Main popup UI (Website Blocker and Todo List)
├── popup.js        # Popup logic (handles user interactions)
├── styles.css      # Styles for the popup
├── blocked.html    # Page displayed when a site is blocked
├── blocked.js      # Logic for the blocked page
└── blocked.css     # Styles for the blocked page
```

## Contributing
We welcome contributions! Open a PR to get started.

## Acknowledgements
<a href="https://www.flaticon.com/free-icons/block" title="block icons">Block icons created by Those Icons - Flaticon</a>

---
