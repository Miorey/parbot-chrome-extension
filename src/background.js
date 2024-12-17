
// Query the active tab as a fallback
const setErrorIcon = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
            const tabId = tabs[0].id; // Active tab ID
            console.error('Fallback tabId:', tabId);
            chrome.action.setIcon({ path: "icons/icon-error.png", tabId });
        } else {
            console.error("No active tab found for fallback.");
        }
    });
};

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
                            console.log("---> OK")
                            chrome.action.setIcon({ path: 'icons/icon-16.png', tabId });
                            return response.json().then((data) => ({
                                status: response.status,
                                success: true,
                                data,
                            }));
                        }

                        console.log("---> NOT OK")
                        let error;

                        if (response.status === 404) {
                            console.log("icons/icon-not-found.png")
                            chrome.action.setIcon({ path: "icons/icon-not-found.png", tabId: tabId });
                            error = "Info not found";
                        } else {
                            chrome.action.setIcon({ path: "icons/icon-error.png", tabId: tabId });
                            console.log("icons/icon-error.png")
                            error = `Unhandled error: ${response.status}`;
                        }
                        return {
                            status: response.status,
                            success: false,
                            error,
                        };
                    })
                    .then((data) => {
                        sendResponse(data);
                    })
                    .catch((error) => {
                        if (tabId) {
                            chrome.action.setIcon({ path: "icons/icon-error.png", tabId: tabId});
                        } else {
                            setErrorIcon();
                        }
                        sendResponse({ status: 500, success: false, error: error.message });
                    });
            })

        return true; // Indicates asynchronous response
    }
});
