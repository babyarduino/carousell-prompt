console.log('Carousell Auto-Reply: Content script loaded');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getSelection") {
        const selectedText = window.getSelection().toString().trim();
        console.log('Selected text:', selectedText);
        sendResponse({selectedText: selectedText});
    }
    return true; // Keep the message channel open for sendResponse
}); 