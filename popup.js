// Load saved results when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['savedUrls', 'savedMatches', 'savedNonMatches', 'savedBadUrls'], (data) => {
        const urlsList = document.getElementById('urls');
        const matchesList = document.getElementById('matches');
        const nonMatchesList = document.getElementById('non_matches');

        // Clear existing content before appending loaded data
        urlsList.innerHTML = '';
        matchesList.innerHTML = '';
        nonMatchesList.innerHTML = '';

        if (data.savedUrls) {
            data.savedUrls.forEach(url => {
                const urlElement = document.createElement('li');
                urlElement.textContent = `URL: ${url.url} - Protocol: ${url.protocol} - Shortened: ${url.shortened}`;
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
        console.log(data.savedBadUrls)
    });
});
