chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_WEBSITE_INFO') {
        // Extract tab ID from sender.tab or query active tab
        const getTabId = () =>
            new Promise((resolve, reject) => {
                if (sender.tab && sender.tab.id) {
                    resolve(sender.tab.id);
                } else {
                    // Fallback: Query active tab
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs && tabs.length > 0) {
                            resolve(tabs[0].id);
                        } else {
                            reject(new Error("No active tab found"));
                        }
                    });
                }
            });

        // Fetch API and update icon
        getTabId()
            .then((tabId) => {
                const apiUrl = `http://127.0.0.1:8000/startups/startup-info?website=${encodeURIComponent(
                    message.website
                )}`;

                return fetch(apiUrl, {
                    headers: {
                        accept: 'application/json',
                        'X-Access-Token': 'hello_world',
                    },
                })
                    .then((response) => {
                        console.log("Response status:", response.ok);
                        if (response.ok) {
                            chrome.action.setIcon({ path: 'icons/icon-16.png', tabId });
                            return response.json();
                        } else if (response.status === 404) {
                            chrome.action.setIcon({ path: 'icons/icon-not-found.png', tabId });
                            throw new Error('Info not found');
                        } else {
                            chrome.action.setIcon({ path: 'icons/icon-error.png', tabId });
                            throw new Error(`Error ${response.status}`);
                        }
                    })
                    .then((data) => {
                        console.log('API Data:', data);
                        sendResponse({ success: true, data });
                    });
            })
            .catch((error) => {
                console.error('Error:', error.message);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Indicates asynchronous response
    }
});
