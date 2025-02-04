window.onload = async function () {
    const textArea = document.getElementById("selectedText");
    const copyBtn = document.getElementById("copyBtn");

    if (!textArea || !copyBtn) return;  // Prevents errors if elements are not found

    // Automatically fetch highlighted text on popup open
    let selectedText = await getHighlightedText();
    textArea.value = selectedText;  // Show highlighted text

    // Detect keywords and auto-fill responses
    let suggestions = generateSuggestions(selectedText);
    displaySuggestions(suggestions);

    // Copy button functionality
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(textArea.value).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = "Copy Text"; }, 1500);  // Reset button text
        }).catch(err => console.error("Copy failed:", err));
    });
};

// Function to get highlighted text
async function getHighlightedText() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    });

    return result[0].result || "";
}

// Define keyword-based responses
function generateSuggestions(text) {
    const keywordResponses = {
        "price": "The price is negotiable.",
        "available": ["The price is negotiable.", "Let me know your offer!"],
        "meetup": "I prefer to do meetups at MRT stations.",
        "shipping": "I can ship via courier for an additional fee.",
        "payment": "I accept PayNow and bank transfers.",
        "nego": ["The price is negotiable.", "Let me know your offer!"],
        "pm": "Please message",
        "mint": "Mint condition",
        "bnib": "Brand new in box",
        "bnip": "Brand new in package",
        "reserved": "Item is reserved",
        "swop": "Willing to swap/trade",
        "swap": "Willing to swap/trade",
        "trade": "Willing to swap/trade",
        "lnib": "Like new in box",
        "vnds": "Very near deadstock",
        "nwt": "New with tags",
        "nwot": "New without tags"
    };

    let detectedSuggestions = [];
    for (let keyword in keywordResponses) {
        if (text.toLowerCase().includes(keyword)) {
            detectedSuggestions.push(`${keyword}: ${keywordResponses[keyword]}`);
        }
    }
    return detectedSuggestions;
}

// Display keyword matches in the textbox
function displaySuggestions(suggestions) {
    const textArea = document.getElementById('selectedText');

    if (suggestions.length > 0) {
        textArea.value = suggestions.join('\n');  // Show responses in textarea
    } else {
        textArea.value = "No keyword matches found.";
    }
}
