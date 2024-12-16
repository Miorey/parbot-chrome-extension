chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_WEBSITE_INFO') {
        const apiUrl = `http://127.0.0.1:8000/startups/startup-info?website=${encodeURIComponent(
            message.website
        )}`;

        fetch(apiUrl, {
            headers: {
                'accept': 'application/json',
                'X-Access-Token': 'hello_world',
            },
        })
            .then((response) => response.json())
            .then((data) => sendResponse({ success: true, data }))
            .catch((error) => sendResponse({ success: false, error }));

        return true; // Indicates asynchronous response.
    }
});
