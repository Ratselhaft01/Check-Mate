// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in background script:', message);

    if (message.action === 'sendUrls') {
        const { urls, protocols } = message;
        sendCollectedUrls(urls, protocols)
    }
});

function sendCollectedUrls(urls, protocols) {
    fetch('http://15.204.218.195', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: urls })
    })
    .then(response => response.json())
    .then(data => {
        saveResults(data, protocols)
    });
}

function saveResults(data, protocols) {
    const matches = data.Matches
    const non_matches = data.Non_Matches

    // Save URLs and protocol results to storage
    chrome.storage.local.set({
        savedUrls: protocols,
        savedMatches: matches,
        savedNonMatches: non_matches
    }, () => {
        console.log('Results saved:', { protocols, matches, non_matches });
    });
}