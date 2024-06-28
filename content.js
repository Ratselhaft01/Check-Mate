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

console.log(urls)

if (urls) {
    const protocols = checkProtocols(urls);
    chrome.runtime.sendMessage(message = {
        action: 'sendUrls',
        urls: urls,
        protocols: protocols
    });
} else {console.log('No urls to check.');}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received in content script:', message);

    if (message.action === 'sendBadUrls') {
        const { badUrls } = message;
        changeURLColor(badUrls)
    }
});

function changeURLColor(badUrls) {
    badUrls.forEach(url => {
        const linkElements = document.querySelectorAll(`a[href="${url.url}"]`);
        linkElements.forEach(linkElement => {
            linkElement.addClass('maliciousLink');
            console.log(`Found malicious link: ${linkElement}`)
        });
        $('body').append(`
            <style>
            .malisciousLink {
                color: red!important;
            }</style>`);
    });
}