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
                // console.error(chrome.runtime.lastError);
                return;
            }
            updatePopupUI(response);
        });
    });
}

// Load saved results when popup is opened
document.addEventListener('DOMContentLoaded', () => {
    getDataFromActiveTab();

    // Handle the report form submission
    document.getElementById('reportForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const reportUrl = document.getElementById('reportUrl').value;
        const reportExplanation = document.getElementById('reportExplanation').value;

        // Send the report to the server
        fetch('http://15.204.218.195', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request: 'url_submission',
                suspect_url: reportUrl,
                explanation: reportExplanation
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('Report submitted successfully!');
            document.getElementById('reportForm').reset();
        })
        .catch(error => {
            console.error('Error submitting report:', error);
            alert('Error submitting report. Please try again later.');
        });
    });
});
