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
        console.log(data)
        badUrls = badOrGood(data.Matches, protocols)
        saveResults(data, protocols, badUrls)
    });
}

function badOrGood(matches, protocols) {
    const badUrls = [];

    matches.forEach(matchUrl => {
        const matchFound = protocols.find(protocolInfo => protocolInfo.url === matchUrl);

        if (matchFound) {
            badUrls.push({
                url: matchUrl,
                protocol: matchFound.protocol,
                shortened: matchFound.shortened,
                reported: 'YES'
            });
        }
    });

    protocols.forEach(url => {
        if ((url.protocol == 'HTTP' || url.shortened == 'YES') && (!(badUrls.some(e => e.url == url.url)))) {
            badUrls.push({
                url: url.url,
                protocol: url.protocol,
                shortened: url.shortened,
                reported: 'NO'
            });
            console.log(badUrls)
        }
    });

    return badUrls;
}

function saveResults(data, protocols, badUrls) {
    const matches = data.Matches
    const non_matches = data.Non_Matches

    // Save results to storage
    chrome.storage.local.set({
        savedUrls: protocols,
        savedMatches: matches,
        savedNonMatches: non_matches,
        savedBadUrls: badUrls
    }, () => {
        console.log('Results saved:', { protocols, matches, non_matches, badUrls });
    });

    // Send message to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
            action: 'sendBadUrls',
            badUrls: badUrls
        });
    });
}