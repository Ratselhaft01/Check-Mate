// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const badUrls = message.badUrls;
    
    if (message.action === 'sendBadUrls') {
        console.log('Message received in content script:', message);
        changeURLColor(badUrls)
        explanations = getExplanations(badUrls)
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getData') {
        sendResponse(explanations);
        return true;
    }
});

function changeURLColor(badUrls) {
    badUrls.forEach(badUrl => {
        const url = badUrl.url
        const urlSlash = url.endsWith('/') ? url : `${url}/`;
        const urlNoSlash = url.endsWith('/') ? url.slice(0, -1) : url;

        const linkElements1 = Array.from(document.querySelectorAll(`a[href="${urlSlash}"]`));
        const linkElements2 = Array.from(document.querySelectorAll(`a[href="${urlNoSlash}"]`));
        const linkElements = linkElements1.concat(linkElements2)

        linkElements.forEach(linkElement => {
            linkElement.style.background = 'red';
            console.log(`Found malicious link: ${linkElement}`)
        });
    });
}

function getExplanations(badUrls) {
    const explanations = [];

    badUrls.forEach(url => {
        if ((url.protocol == 'HTTP' && url.shortened == 'YES') && url.reported == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url has been reported to have had malware associated with it and should be avoided. This url is also using an insecure internet protocol. This means that everything you do on the site and everything the site tells you can be much more seen by a hacker. This url has also been shortened using a shortening service and so the true url has been hidden in a way. This doesn't mean that it is bad, but it is something you have to be careful about."
            })
        }
        else if (url.protocol == 'HTTP' && url.shortened == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url is using an insecure internet protocol. This means that everything you do on the site and everything the site tells you can be much more seen by a hacker. This url has also been shortened using a shortening service and so the true url has been hidden in a way. This doesn't mean that it is bad, but it is something you have to be careful about."
            })
        } 
        else if (url.protocol == 'HTTP' && url.reported == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url has been reported to have had malware associated with it and should be avoided. This url is also using an insecure internet protocol. This means that everything you do on the site and everything the site tells you can be much more seen by a hacker."
            })
        }
        else if (url.shortened == 'YES' && url.reported == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url has been reported to have had malware associated with it and should be avoided. This url has also been shortened using a shortening service and so the true url has been hidden in a way. This doesn't mean that it is bad, but it is something you have to be careful about."
            })
        }
        else if (url.protocol == 'HTTP') {
            explanations.push({
                url: url.url,
                explanation: "This url is using an insecure internet protocol. This means that everything you do on the site and everything the site tells you can be much more seen by a hacker."
            })
        }
        else if (url.shortened == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url has been shortened using a shortening service and so the true url has been hidden in a way. This doesn't mean that it is bad, but it is something you have to be careful about."
            })
        }
        else if (url.reported == 'YES') {
            explanations.push({
                url: url.url,
                explanation: "This url has been reported to have had malware associated with it and should be avoided."
            })
        }
    });

    return explanations;
}

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
            const shortened = isShortenedUrl(url) ? 'YES' : 'NO'; // Check if URL is shortened
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
var explanations = []

if (urls) {
    const protocols = checkProtocols(urls);
    chrome.runtime.sendMessage(message = {
        action: 'sendUrls',
        urls: urls,
        protocols: protocols
    });
} else {console.log('No urls to check.');}
