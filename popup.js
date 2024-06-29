// Function to update the popup UI with data
function updatePopupUI(data) {
    const dataDiv = document.getElementById('data');
    dataDiv.innerHTML = data.map(item => `
        <div class="url-item">
            <p class="url">${item.url}</p>
            <button class="toggle-button">Explanation</button>
            <p class="explanation" style="display: none;">${item.explanation}</p>
        </div>
    `).join('');

    // Add event listeners to toggle buttons
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const explanation = dataDiv.querySelectorAll('.explanation')[index];
            explanation.style.display = explanation.style.display === 'none' ? 'block' : 'none';
        });
    });
}

// Function to get data from the content script of the active tab
function getDataFromActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { action: 'getData' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }
            updatePopupUI(response);
        });
    });
}

// Load saved results when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    getDataFromActiveTab();

    // chrome.storage.local.get(['savedUrls', 'savedMatches', 'savedNonMatches', 'savedBadUrls'], (data) => {
    //     const urlsList = document.getElementById('urls');
    //     const matchesList = document.getElementById('matches');
    //     const nonMatchesList = document.getElementById('non_matches');

    //     // Clear existing content before appending loaded data
    //     urlsList.innerHTML = '';
    //     matchesList.innerHTML = '';
    //     nonMatchesList.innerHTML = '';

    //     if (data.savedUrls) {
    //         data.savedUrls.forEach(url => {
    //             const urlElement = document.createElement('li');
    //             urlElement.textContent = `URL: ${url.url} - Protocol: ${url.protocol} - Shortened: ${url.shortened}`;
    //             urlsList.appendChild(urlElement);
    //         });
    //     }

    //     if (data.savedMatches) {
    //         data.savedMatches.forEach(matchText => {
    //             const matchElement = document.createElement('li');
    //             matchElement.textContent = matchText;
    //             matchesList.appendChild(matchElement);
    //         });
    //     }

    //     if (data.savedNonMatches) {
    //         data.savedNonMatches.forEach(nonMatchText => {
    //             const nonMatchElement = document.createElement('li');
    //             nonMatchElement.textContent = nonMatchText;
    //             nonMatchesList.appendChild(nonMatchElement);
    //         });
    //     }

    //     console.log('Results loaded!'); // Debugging statement to confirm loading
    //     console.log(data.savedBadUrls)
    // });
});
