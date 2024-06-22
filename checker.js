document.getElementById('check-urls').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                files: ['link_extractor.js']
            },
            (results) => {
                if (results) {
                    const urls = results[0].result;
                    const protocolResults = checkProtocols(urls);
                    sendCollectedUrls(urls, protocolResults);
                    // saveResults();
                } else {console.log('No urls to check.');}
            }
        );
    });
});

function isShortenedUrl(url) {
    // List of common URL shortener domains
    const shortenerDomains = [
        'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'ow.ly', 'buff.ly', 'rebrand.ly', 'is.gd', 'bl.ink', 'mcaf.ee', 'tiny.cc', 'lnkd.in', 't2mio.com', 'shorte.st', 'cutt.ly', 'qr.ae', 'v.gd', 'clck.ru'
        // Add more as needed
    ];

    // Check if the URL's domain matches a known shortener domain
    const domain = (new URL(url)).hostname;
    if (shortenerDomains.includes(domain)) {
        return true;
    }

    return false
}

function checkProtocols(urls) {
    return urls.map(url => {
        try {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol === 'https:' ? 'HTTPS' : 'HTTP';
            const shortened = isShortenedUrl(url) ? 'Yes' : 'No'; // Check if URL is shortened
            return {
                url: url,
                protocol: protocol,
                shortened: shortened // Include whether URL is shortened in the result
            };
        } catch (error) {
            return {
                url: url,
                protocol: 'Invalid URL',
                shortened: 'N/A'
            };
        }
    });
}

function sendCollectedUrls(urls, protocolResults) {
    fetch('http://15.204.218.195', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: urls })
    })
    .then(response => response.json())
    .then(data => {
        displayResults(protocolResults, data);
        saveResults();
    });
    // .catch(error => console.error('Error:', error));
}

function displayResults(results, data) {
    const protocolList = document.getElementById('urls');
    protocolList.innerHTML = ''
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = `URL: ${result.url} - Protocol: ${result.protocol} - Shortened: ${result.shortened}`;
        protocolList.appendChild(li);
    });

    const matchesList = document.getElementById('matches');
    matchesList.innerHTML = ''
    data.Matches.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        matchesList.appendChild(li);
    });

    const nonMatchesList = document.getElementById('non_matches');
    nonMatchesList.innerHTML = ''
    data.Non_Matches.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        nonMatchesList.appendChild(li);
    });
}

function saveResults() {
    const urlsList = document.getElementById('urls');
    const matchesList = document.getElementById('matches');
    const nonMatchesList = document.getElementById('non_matches');

    const urls = Array.from(urlsList.children).map(child => child.textContent);
    const matches = Array.from(matchesList.children).map(child => child.textContent);
    const nonMatches = Array.from(nonMatchesList.children).map(child => child.textContent);

    chrome.storage.local.set({
        savedUrls: urls,
        savedMatches: matches,
        savedNonMatches: nonMatches
    }, () => {
        console.log('Results saved!'); // Debugging statement to confirm saving
    });
}


// Load saved results when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['savedUrls', 'savedMatches', 'savedNonMatches'], (data) => {
        const urlsList = document.getElementById('urls');
        const matchesList = document.getElementById('matches');
        const nonMatchesList = document.getElementById('non_matches');

        // Clear existing content before appending loaded data
        urlsList.innerHTML = '';
        matchesList.innerHTML = '';
        nonMatchesList.innerHTML = '';

        if (data.savedUrls) {
            data.savedUrls.forEach(urlText => {
                const urlElement = document.createElement('li');
                urlElement.textContent = urlText;
                urlsList.appendChild(urlElement);
            });
        }

        if (data.savedMatches) {
            data.savedMatches.forEach(matchText => {
                const matchElement = document.createElement('li');
                matchElement.textContent = matchText;
                matchesList.appendChild(matchElement);
            });
        }

        if (data.savedNonMatches) {
            data.savedNonMatches.forEach(nonMatchText => {
                const nonMatchElement = document.createElement('li');
                nonMatchElement.textContent = nonMatchText;
                nonMatchesList.appendChild(nonMatchElement);
            });
        }

        console.log('Results loaded!'); // Debugging statement to confirm loading
    });
});
