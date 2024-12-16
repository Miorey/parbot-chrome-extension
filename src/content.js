// Extract the current page URL
const currentPageUrl = window.location.href;

// Send the URL to the background script
chrome.runtime.sendMessage({ type: 'GET_WEBSITE_INFO', website: currentPageUrl });
