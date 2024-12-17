# Parbot Chrome Extension

## Summary
Parbot Chrome Extension checks if a website exists and fetches its corresponding information from the Parbot API.

---

## Features
- Automatically checks website info when browsing any page.
- Displays retrieved website data (e.g., name, domain, Airtable ID).
- Updates the extension icon based on API response:
    - 🟢 **Colored Parbot Icon**: Website info found.
    - ⚪ **Monochrome Parbot Icon**: Website not found.
    - 🚫 **Monochrome Barred Icon**: API or connection error.

---

## Installation

1. Clone the repository to your local machine:
   ```sh
   git clone https://github.com/Miorey/parbot-chrome-extension.git
   ```

2. Open Chrome and navigate to the Extensions page:
    - Enter `chrome://extensions` in your browser.
    - Enable **Developer mode** (toggle on the top-right corner).

3. Load the extension:
    - Click on **Load unpacked**.
    - Select the directory where the repository was cloned.

---

## Configuration

1. At the root of the project, create a `config.json` file:
    ```json
    {
    "API_URL": "https://your-api-url.com",
    "API_KEY": "your-api-key-here"
    }
    ```

    - Replace `https://your-api-url.com` with your Parbot API endpoint.
    - Replace `your-api-key-here` with a valid API key.

2. Ensure `config.json` is added to the project root.

3. Reload the extension from Chrome's Extensions page.

---

## Usage
- Navigate to any website.
- The extension icon updates based on the result:
    - 🟢 **Colored Parbot Icon**: Website info successfully retrieved.
    - ⚪ **Monochrome Parbot Icon**: Website not found.
    - 🚫 **Monochrome Barred Icon**: An error occurred.
- Click the extension icon to view details in the popup.

---

## Technical Details
- **Frameworks & Tools**:
    - **Vue 3**: For building the popup UI.
    - **Vite**: For fast and efficient development.
- **Manifest Version**: 3
- **Service Worker**: `background.js`
- **Popup UI**: `index.html`
- **Config File**: `config.json` (API endpoint and key)
- **Permissions**:
    - `tabs`, `activeTab`: Interact with active browser tabs.
    - `scripting`: Modify browser behavior.
    - `storage`: Manage extension-related storage.
    - `host_permissions`: Allow requests to any URL.
- **Icons**: Located in the `icons/` directory.

---

## Repository
[https://github.com/Miorey/parbot-chrome-extension](https://github.com/Miorey/parbot-chrome-extension)

---
