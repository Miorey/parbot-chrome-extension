chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_WEBSITE_INFO') {
        console.log("YOLO", message);
        console.log(`sender`, sender);

        const handleFetch = (tabId, website) => {
            const apiUrl = `http://127.0.0.1:8000/startups/startup-info?website=${encodeURIComponent(
                website
            )}`;

            fetch(apiUrl, {
                headers: {
                    'accept': 'application/json',
                    'X-Access-Token': 'hello_world',
                },
            })
                .then((response) => {
                    console.log("YOLO", response.ok);
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
                })
                .catch((error) => {
                    console.error('Fetch Error:', error);
                    sendResponse({ success: false, error: error.message });
                });

            return true; // Indicates asynchronous response
        };

        // If `sender.tab` is defined, use it; otherwise, query the active tab
        if (sender.tab) {
            console.log(`sender.tab`, sender.tab);
            console.log(`sender.tab.id`, sender.tab.id);

            // Call fetch with the tab's ID and the website URL
            handleFetch(sender.tab.id, message.website);
        } else {
            // Query the active tab if sender.tab is not defined
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    console.log(`Active tab:`, activeTab);

                    // Call fetch with the active tab's ID and the website URL
                    handleFetch(activeTab.id, message.website);
                } else {
                    console.error("No active tab found!");
                    sendResponse({ success: false, error: 'No active tab found' });
                }
            });
        }

        return true; // Indicates asynchronous response
    }
});
