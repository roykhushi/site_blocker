# Website Blocker Chrome Extension

A powerful and user-friendly Chrome extension that helps you manage your browsing habits by blocking distracting websites.

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
- Enter domain name (e.g., `facebook.com`)
- Click "Block" or press Enter
- Works without `http://` or `www.` prefixes

### Manage Blocked Sites
- View all blocked sites
- Track blocking frequency
- One-click unblock
- Clean interface

### Favorites Section
- Auto-tracks frequent blocks
- Shows top 5 blocked sites
- Quick management options
- Easy unblocking

### Blocking Mechanism
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

## File Structure
```
site_blocker/
├── manifest.json    # Config
├── background.js    # Service worker
├── popup.html      # UI
├── popup.js        # Logic
├── styles.css      # UI styles
├── blocked.html    # Block page
├── blocked.js      # Block logic
└── blocked.css     # Block styles
```

## Contributing
We welcome contributions! Open a PR to get started.

## Acknowledgements
<a href="https://www.flaticon.com/free-icons/block" title="block icons">Block icons created by Those Icons - Flaticon</a>


---
