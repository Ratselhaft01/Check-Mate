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
                    saveResults();
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
    fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urls: urls })
    })
    .then(response => response.json())
    .then(data => {
        displayResults(protocolResults, data);
    });
    // .catch(error => console.error('Error:', error));
}

function displayResults(results, data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    const protocolList = document.createElement('ul');
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = `URL: ${result.url} - Protocol: ${result.protocol} - Shortened: ${result.shortened}`;
        protocolList.appendChild(li);
    });
    resultsContainer.appendChild(protocolList);

    const matchesHeader = document.createElement('h3');
    matchesHeader.textContent = 'Matches:';
    resultsContainer.appendChild(matchesHeader);

    const matchesList = document.createElement('ul');
    data.Matches.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        matchesList.appendChild(li);
    });
    resultsContainer.appendChild(matchesList);

    const nonMatchesHeader = document.createElement('h3');
    nonMatchesHeader.textContent = 'Non-Matches:';
    resultsContainer.appendChild(nonMatchesHeader);

    const nonMatchesList = document.createElement('ul');
    data.Non_Matches.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        nonMatchesList.appendChild(li);
    });
    resultsContainer.appendChild(nonMatchesList);
}

function saveResults() {
    const resultsContainer = document.getElementById('results');
    const results = Array.from(resultsContainer.children).map(child => child.textContent);

    chrome.storage.local.set({ savedResults: results }, () => {
        // alert('Results saved!');
    });
}

// Load saved results when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('savedResults', (data) => {
        if (data.savedResults) {
            const resultsContainer = document.getElementById('results');

            data.savedResults.forEach(resultText => {
                const resultElement = document.createElement('div');
                resultElement.textContent = resultText;
                resultElement.className = 'result';
                resultsContainer.appendChild(resultElement);
            });
        }
    });
});