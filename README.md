### Features

1. **Block Websites**:

1. Enter a domain name (e.g., facebook.com) in the input field
2. Click "Block" or press Enter to add it to your blocked list



2. **Manage Blocked Sites**:

1. View all blocked sites in the "Blocked Websites" section
2. Each site shows how many times it has been blocked
3. Click "Unblock" to remove a site from the list



3. **Favorites Section**:

1. The extension automatically tracks your most frequently blocked sites
2. The top 5 most blocked sites appear in the "Favorites" section
3. You can also unblock sites directly from this section



4. **Blocking Mechanism**:

1. When you visit a blocked site, you'll see a blocking page
2. The extension checks both exact domain matches and subdomains





### Technical Details

- The extension uses Chrome's storage API to persist your blocked sites
- The background script monitors tab updates to check if a site should be blocked
- The popup interface provides a user-friendly way to manage your blocked sites
- The extension works with all websites and doesn't require any special permissions beyond what's needed for its functionality