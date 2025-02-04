window.onload = async function () {
    const suggestionsDiv = document.getElementById("suggestions");
    const title = document.getElementById("title");
    const slider = document.getElementById("toneSlider");
    const toneLabel = document.getElementById("toneLabel");

    let selectedText = await getHighlightedText();
    let { detectedKeyword, suggestions } = generateSuggestions(selectedText, slider.value);

    title.textContent = detectedKeyword ? `Keyword: ${detectedKeyword}` : "No keyword detected";
    toneLabel.textContent = getToneLabel(slider.value);
    displaySuggestions(suggestions);

    // Update responses and tone label dynamically when slider moves
    slider.addEventListener("input", () => {
        let { detectedKeyword, suggestions } = generateSuggestions(selectedText, slider.value);
        title.textContent = detectedKeyword ? `Keyword: ${detectedKeyword}` : "No keyword detected";
        toneLabel.textContent = getToneLabel(slider.value);
        displaySuggestions(suggestions);
    });
};

// Get highlighted text
async function getHighlightedText() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    });

    return result[0].result || "";
}

// Define multiple keyword-based responses with different tones
function generateSuggestions(text, toneLevel) {
    const keywordResponses = {
        "price": [
            ["Price is flexible!", "Let me know your offer!", "Open to negotiation."], 
            ["The price is negotiable.", "I'm open to offers.", "Feel free to make a reasonable offer."], 
            ["I am open to discussing the price.", "The listed price is negotiable to some extent.", "If you have an offer in mind, I’d be happy to consider it."]
        ],
        "available": [
            ["Yep, still got it!", "Yes, still up!", "It’s available!"], 
            ["Yes, this item is still available.", "It's still up for sale.", "I still have it!"], 
            ["This item is available for purchase.", "It remains available at the moment.", "I can confirm that it’s still available."]
        ],
        "meetup": [
            ["Meet at MRT ok?", "I can meet anywhere convenient.", "Where works for you?"], 
            ["I prefer meetups at MRT stations.", "Let me know your preferred meetup location.", "I'm open to meetup locations."], 
            ["I usually arrange meetups at MRT stations.", "I prefer meeting in a mutually convenient location.", "Happy to coordinate a suitable meeting point."]
        ],
        "shipping": [
            ["Can ship, small extra cost.", "Shipping possible, fee applies.", "I can mail it over!"], 
            ["I can ship via courier for an additional fee.", "Shipping is available at an extra cost.", "I offer shipping via courier."], 
            ["I provide courier shipping for an additional charge.", "Shipping can be arranged at an extra cost.", "I am happy to ship via a courier service."]
        ],
        "payment": [
            ["PayNow or cash?", "PayNow works best!", "Cash on meetup ok?"], 
            ["I accept PayNow and bank transfers.", "Payment via PayNow or bank transfer.", "Cash on meetup or PayNow."], 
            ["Accepted payment methods include PayNow and bank transfer.", "I prefer transactions via PayNow or bank.", "Let me know your preferred payment method."]
        ]
    };

    let detectedSuggestions = [];
    let detectedKeyword = null;

    for (let keyword in keywordResponses) {
        if (text.toLowerCase().includes(keyword)) {
            detectedKeyword = keyword;
            detectedSuggestions = keywordResponses[keyword][toneLevel]; 
            break;
        }
    }

    return { detectedKeyword, suggestions: detectedSuggestions };
}

// Function to get the corresponding tone label
function getToneLabel(value) {
    const tones = ["Friendly", "Neutral", "Damn CB"];
    return `Tone: ${tones[value]}`;
}

// Display keyword matches as multiple buttons
function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "";

    if (suggestions.length > 0) {
        suggestions.forEach(response => {
            let btn = document.createElement("button");
            btn.textContent = response;
            btn.addEventListener("click", () => {
                navigator.clipboard.writeText(response).then(() => {
                    btn.textContent = "Copied!";
                    setTimeout(() => { btn.textContent = response; }, 1500);
                });
            });
            suggestionsDiv.appendChild(btn);
        });
    } else {
        suggestionsDiv.innerHTML = "<p class='no-keywords'>No keyword matches found.</p>";
    }
}
