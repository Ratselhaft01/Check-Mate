function link_extractor() {
    const urls = [];
    const anchorTags = document.querySelectorAll('a');

    anchorTags.forEach(anchor => {
        const href = anchor.href;
        if (href) {
            urls.push(href);
        }
    });

    return urls;
}

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

urls = link_extractor();

console.log(urls)

if (urls) {
    // const urls = results[0].result;
    const protocols = checkProtocols(urls);
    chrome.runtime.sendMessage(message = {
        action: 'sendUrls',
        urls: urls,
        protocols: protocols
    });
    // saveResults();
} else {console.log('No urls to check.');}






// function saveResults() {
//     const urlsList = document.getElementById('urls');
//     const matchesList = document.getElementById('matches');
//     const nonMatchesList = document.getElementById('non_matches');
    
//     const urls = Array.from(urlsList.children).map(child => child.textContent);
//     const matches = Array.from(matchesList.children).map(child => child.textContent);
//     const nonMatches = Array.from(nonMatchesList.children).map(child => child.textContent);
    
//     chrome.storage.local.set({
//         savedUrls: urls,
//         savedMatches: matches,
//         savedNonMatches: nonMatches
//     }, () => {
//         console.log('Results saved!'); // Debugging statement to confirm saving
//     });
// }

// function displayResults(results, data) {
//     const protocolList = document.getElementById('urls');
//     protocolList.innerHTML = ''
//     results.forEach(result => {
//         const li = document.createElement('li');
//         li.textContent = `URL: ${result.url} - Protocol: ${result.protocol} - Shortened: ${result.shortened}`;
//         protocolList.appendChild(li);
//     });

//     const matchesList = document.getElementById('matches');
//     matchesList.innerHTML = ''
//     data.Matches.forEach(url => {
//         const li = document.createElement('li');
//         li.textContent = url;
//         matchesList.appendChild(li);
//     });

//     const nonMatchesList = document.getElementById('non_matches');
//     nonMatchesList.innerHTML = ''
//     data.Non_Matches.forEach(url => {
//         const li = document.createElement('li');
//         li.textContent = url;
//         nonMatchesList.appendChild(li);
//     });
// }