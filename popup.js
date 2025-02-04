window.onload = async function () {
    const suggestionsDiv = document.getElementById("suggestions");
    const title = document.getElementById("title"); // Get the title element

    // Automatically fetch highlighted text on popup open
    let selectedText = await getHighlightedText();

    // Detect keywords and auto-fill responses
    let { detectedKeyword, suggestions } = generateSuggestions(selectedText);

    // Update the title to show the detected keyword or "No keyword detected"
    title.textContent = detectedKeyword ? `Keyword: ${detectedKeyword}` : "No keyword detected";

    // Display the suggestions
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
    let detectedKeyword = null;

    for (let keyword in keywordResponses) {
        if (text.toLowerCase().includes(keyword)) {
            detectedKeyword = keyword; // Store the first detected keyword
            detectedSuggestions = keywordResponses[keyword];
            break; // Stop at the first match
        }
    }

    return { detectedKeyword, suggestions: detectedSuggestions };
}

// Display keyword matches as separate buttons
function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = ""; // Clear previous results

    if (suggestions.length > 0) {
        suggestions.forEach(response => {
            let btn = document.createElement("button");
            btn.textContent = response;
            btn.className = "response-btn"; // Apply the red button style

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
