window.onload = async function () {
    const suggestionsDiv = document.getElementById("suggestions");

    // Automatically fetch highlighted text on popup open
    let selectedText = await getHighlightedText();

    // Detect keywords and auto-fill responses
    let suggestions = generateSuggestions(selectedText);
    displaySuggestions(suggestions);
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

// Define keyword-based responses (Multiple Responses)
function generateSuggestions(text) {
    const keywordResponses = {
        "price": ["The price is negotiable.", "Let me know your offer!"],
        "available": ["Yes, this item is still available!", "Still up for grabs!"],
        "meetup": ["I prefer to do meetups at MRT stations.", "Meetups available at a central location."],
        "shipping": ["I can ship via courier for an additional fee.", "Delivery available with extra cost."],
        "payment": ["I accept PayNow and bank transfers.", "Cash on delivery is also an option."],
        "nego": ["Negotiable", "Open to offers."],
        "pm": ["Please message", "DM me for details."],
        "mint": ["Mint condition", "Like new, barely used."],
        "bnib": ["Brand new in box", "Unopened and unused."],
        "bnip": ["Brand new in package", "Still in original packaging."],
        "reserved": ["Item is reserved", "Currently on hold for a buyer."],
        "swop": ["Willing to swap/trade", "Looking for trade offers."],
        "swap": ["Willing to swap/trade", "Exchange possible for certain items."],
        "trade": ["Willing to swap/trade", "Open to trading for equivalent value."],
        "lnib": ["Like new in box", "Very lightly used, near new."],
        "vnds": ["Very near deadstock", "Almost new condition."],
        "nwt": ["New with tags", "Unused and comes with original tags."],
        "nwot": ["New without tags", "Never worn, but tags removed."]
    };

    let detectedSuggestions = [];
    for (let keyword in keywordResponses) {
        if (text.toLowerCase().includes(keyword)) {
            detectedSuggestions = detectedSuggestions.concat(keywordResponses[keyword]);
        }
    }
    return detectedSuggestions;
}

// Display keyword matches as separate buttons
function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = ""; // Clear previous results

    if (suggestions.length > 0) {
        suggestions.forEach(response => {
            let btn = document.createElement("button");
            btn.textContent = response;
            btn.style.display = "block";
            btn.style.width = "100%";
            btn.style.margin = "5px 0";
            btn.style.padding = "8px";
            btn.style.background = "#007bff";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.cursor = "pointer";
            btn.style.borderRadius = "5px";

            // Copy response to clipboard on click
            btn.addEventListener("click", () => {
                navigator.clipboard.writeText(response).then(() => {
                    btn.textContent = "Copied!";
                    setTimeout(() => { btn.textContent = response; }, 1500);  // Reset button text
                }).catch(err => console.error("Copy failed:", err));
            });

            suggestionsDiv.appendChild(btn);
        });
    } else {
        suggestionsDiv.innerHTML = "<p>No keyword matches found.</p>";
    }
}
