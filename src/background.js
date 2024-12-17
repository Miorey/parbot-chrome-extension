/** @type {{API_URL: string, API_KEY: string}} */
let config;

/**
 * Loads configuration from the config.json file.
 * @returns {Promise<void>} Resolves when config is loaded successfully.
 */
const loadConfig = () => {
    return fetch(chrome.runtime.getURL("config.json"))
        .then((response) => response.json())
        .then((data) => {
            config = data;
        })
        .catch((error) => {
            console.error("Failed to load config.json:", error);
            throw new Error("Missing or invalid config.json");
        });
};

/**
 * Sets the Chrome extension icon to 'error' as a fallback when no tab ID is available.
 */
const setErrorIcon = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
            const tabId = tabs[0].id;
            chrome.action.setIcon({ path: "icons/icon-error.png", tabId });
        } else {
            console.error("No active tab found for fallback.");
        }
    });
};

/**
 * Gets the tab ID from the sender object or queries the active tab as a fallback.
 * @param {chrome.runtime.MessageSender} sender - The sender object from the message listener.
 * @returns {Promise<number>} A promise resolving to the active tab's ID.
 */
const getTabId = (sender) => {
    return new Promise((resolve, reject) => {
        if (sender.tab && sender.tab.id) {
            resolve(sender.tab.id);
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    resolve(tabs[0].id);
                } else {
                    reject(new Error("No active tab found"));
                }
            });
        }
    });
};

/**
 * Fetches the website info from the API.
 * @param {string} website - The website URL to query.
 * @returns {Promise<Object>} A promise resolving to the API response.
 */
const fetchWebsiteInfo = async (website) => {
    const url = `${config.API_URL}/startups/startup-info?website=${encodeURIComponent(website)}`;
    const response = await fetch(url, {
        headers: {
            accept: "application/json",
            "X-Access-Token": config.API_KEY,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw { status: response.status, message: response.status === 404 ? "Info not found" : `Error ${response.status}` };
    }

    return { status: response.status, success: true, data };
};

/**
 * Updates the Chrome extension icon based on the request's success or failure status.
 * @param {number} tabId - The ID of the tab where the icon should be updated.
 * @param {boolean} success - Whether the request was successful.
 * @param {number} status - The HTTP status code.
 */
const updateIcon = (tabId, success, status) => {
    let iconPath = "icons/icon-error.png";
    if (success) iconPath = "icons/icon-16.png";
    else if (status === 404) iconPath = "icons/icon-not-found.png";

    chrome.action.setIcon({ path: iconPath, tabId });
};

/**
 * Handles messages sent to the Chrome extension.
 * @param {Object} message - The message sent to the listener.
 * @param {chrome.runtime.MessageSender} sender - The sender of the message.
 * @param {function} sendResponse - Callback to send a response back to the sender.
 * @returns {boolean} Returns `true` to indicate asynchronous response handling.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_WEBSITE_INFO") {
        getTabId(sender)
            .then((tabId) =>
                fetchWebsiteInfo(message.website)
                    .then((result) => {
                        updateIcon(tabId, true, result.status);
                        sendResponse(result);
                    })
                    .catch((error) => {
                        console.error("API Error:", error.message);
                        updateIcon(tabId, false, error.status || 500);
                        sendResponse({ success: false, error: error.message, status: error.status || 500 });
                    })
            )
            .catch((error) => {
                console.error("Tab Error:", error.message);
                setErrorIcon();
                sendResponse({ success: false, error: "Failed to retrieve tab ID", status: 500 });
            });

        return true;
    }
});

// Load the config file before handling messages
loadConfig().then(() => console.log("Config loaded successfully."));
