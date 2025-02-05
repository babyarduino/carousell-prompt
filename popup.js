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
async function updateSuggestions(selectedText, toneLevel) {
    let { detectedKeyword, suggestions } = await generateSuggestions(selectedText, toneLevel);
    document.getElementById("title").textContent = detectedKeyword ? `Keyword: ${detectedKeyword}` : "No keyword detected";
    document.getElementById("toneLabel").textContent = getToneLabel(toneLevel);
    displaySuggestions(suggestions);
}

// Retrieve stored keyword-response pairs and merge with default keywords
async function generateSuggestions(text, toneLevel) {
    let detectedSuggestions = [];
    let detectedKeyword = null;
    text = text.toLowerCase();

    let keywordResponses = await getStoredKeywordMappings(); // Get stored mappings

    for (let keywords in keywordResponses) {
        const keywordsList = keywords.split(", ");
        for (let key of keywordsList) {
            if (text.includes(key)) {
                detectedKeyword = key;

                let responses = keywordResponses[keywords];
                if (responses) {
                    detectedSuggestions = [
                        responses.friendly,
                        responses.neutral,
                        responses.damnCB
                    ][toneLevel]; // Pick the correct tone response
                }
                
                break;
            }
        }
        if (detectedSuggestions.length > 0) {
            break;
        }
    }

    return { detectedKeyword, suggestions: [detectedSuggestions] };
}

// Retrieve stored keyword mappings from Chrome storage
function getStoredKeywordMappings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("mappings", (data) => {
            resolve(data.mappings || {});
        });
    });
}

// Get the tone label
function getToneLabel(value) {
    const tones = ["Friendly", "Neutral", "Damn CB"];
    return `Tone: ${tones[value]}`;
}

// Display keyword matches as buttons
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

// Click to Manage Keywords in options.html
document.getElementById("manageKeywords").addEventListener("click", () => {
    chrome.tabs.create({ url: "options.html" });
});
