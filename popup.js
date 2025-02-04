window.onload = async function () {
    const suggestionsDiv = document.getElementById("suggestions");
    const title = document.getElementById("title");
    const slider = document.getElementById("toneSlider");
    const toneLabel = document.getElementById("toneLabel");

    let selectedText = await getHighlightedText();
    updateSuggestions(selectedText, slider.value);

    slider.addEventListener("input", () => updateSuggestions(selectedText, slider.value));
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

// Update suggestions dynamically
function updateSuggestions(selectedText, toneLevel) {
    const { detectedKeyword, suggestions } = generateSuggestions(selectedText, toneLevel);
    document.getElementById("title").textContent = detectedKeyword ? `Keyword: ${detectedKeyword}` : "No keyword detected";
    document.getElementById("toneLabel").textContent = getToneLabel(toneLevel);
    displaySuggestions(suggestions);
}

// Define multiple keywords that fetch the same responses
function generateSuggestions(text, toneLevel) {
    const keywordResponses = {
        "price, offer, $": [
            ["You got a deal!", "That offer is a bit low—perhaps you can reconsider?"], 
            ["Sure.", "Sorry, can't do."], 
            ["Can.", "Go fuck spider la."]
        ],

        "interested, would like, would love": [
            ["Sure! Let me know a date and time to reserve the item for you!"], 
            ["OK. Pls update me timing for collection to reserve."], 
            ["LMK your pick-up timing to reserve item."]
        ],

        "need, want": [
            ["Kindly read the description section of my item listing again, thanks!"], 
            ["Pls read item description thx."], 
            ["I want your mother la."]
        ],

        "available, availability": [
            ["Yes! It's definitely available!:)", "Sorry, no :( Someone choped it before you did!", "I'm currently negotiating with another buyer, but I'll update you if anything changes!"], 
            ["Yup! Interested?", "It's been sold!", "I'm currently negotiating with another buyer."], 
            ["Ya", "See la, you indecisive then gone alr liao", "If buyer DW then your turn ah."]
        ],

        "meetup, meet-up, meet, meeting, pickup, what time, timing": [
            ["I usually arrange meetings beneath my block at Jalan Membina Block 27A, 163027. Option for self-collection is also available!:)"], 
            ["Kindly schedule your preferred meeting time at S163027, self-collection available."], 
            ["Meet @ 163026 OK?"]
        ],

        "mrt, MRT, train, station": [
            ["Unfortunately this will be subject to my schedule, and my selling price minus postage fee applies!"], 
            ["Meetups are at S163027, self-collection available."], 
            ["Sorry, self-pickup only."]
        ],

        "shipping, post, postage, mail, mailing": [
            ["If you’d like it mailed, it’ll be $ (incl. delivery), or you’re welcome to arrange your own pick-up. Happy to give this away for free at my convenience! Let me know what works best for you! Thanks for understanding. 🙌"], 
            ["That would be $ , which includes postage fee. If you're OK, pls Paynow to 96157448."], 
            ["It's $ for shipping, Paynow to 96157448."]
        ],

        "payment, paynow, pay": [
            ["Kindly Paynow me at 96157448, thank you! Also, let me know your address and I'll post out the package as soon as possible!"], 
            ["Will post package asap after you Paynow the $$$ and address to 96157448 thanks."], 
            ["Paynow @ 96157448 & address pls"]
        ]
    };

    let detectedSuggestions = [];
    let detectedKeyword = null;
    text = text.toLowerCase(); // Ensure case-insensitive matching

    for (let keywords in keywordResponses) {
        const keywordsList = keywords.split(", ");
        for (let key of keywordsList) {
            if (text.includes(key)) {
                detectedKeyword = key; // Store detected keyword
                detectedSuggestions = keywordResponses[keywords][toneLevel];
                break;
            }
        }
        if (detectedSuggestions.length > 0) {
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
