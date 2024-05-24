(function() {
    const urls = [];
    const anchorTags = document.querySelectorAll('a');

    anchorTags.forEach(anchor => {
        const href = anchor.href;
        if (href) {
            urls.push(href);
        }
    });

    return urls;
})();