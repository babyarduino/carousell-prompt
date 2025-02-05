window.onload = async function () {
    const suggestionsDiv = document.getElementById("suggestions");
    const title = document.getElementById("title");
    const slider = document.getElementById("toneSlider");
    const toneLabel = document.getElementById("toneLabel");

    let selectedText = await getHighlightedText();
    await updateSuggestions(selectedText, slider.value);

    slider.addEventListener("input", async () => {
        await updateSuggestions(selectedText, slider.value);
    });

    // Ensure "Manage Keywords" button works
    document.getElementById("manageKeywords").addEventListener("click", () => {
        chrome.tabs.create({ url: "options.html" });
    });
};

// Get highlighted text
async function getHighlightedText() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString().toLowerCase().trim()
    });

    return result[0]?.result || "";
}

// Update suggestions dynamically
async function updateSuggestions(selectedText, toneLevel) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "<p>Loading responses...</p>"; // Show loading

    if (!selectedText) {
        suggestionsDiv.innerHTML = "<p class='no-keywords'>No text selected.</p>";
        return;
    }

    let { detectedKeywords, suggestions } = await generateSuggestions(selectedText, toneLevel);

    document.getElementById("title").textContent = detectedKeywords.length > 0
        ? `Keywords: ${detectedKeywords.join(", ")}`
        : "No keyword detected";
    
    document.getElementById("toneLabel").textContent = getToneLabel(toneLevel);

    displaySuggestions(suggestions);
}

// Retrieve stored keyword-response pairs
async function generateSuggestions(text, toneLevel) {
    let detectedKeywords = [];
    let detectedResponses = [];
    let keywordResponses = await getStoredKeywordMappings();
    let toneCategories = ["friendly", "neutral", "damnCB"];
    let selectedTone = toneCategories[toneLevel];

    console.log("Selected text for matching:", text);
    console.log("Keyword responses in storage:", keywordResponses);

    for (let keywordGroup in keywordResponses) {
        const keywordsList = keywordGroup.split(", ").map(k => k.toLowerCase().trim());

        for (let keyword of keywordsList) {
            if (text.includes(keyword)) {
                detectedKeywords.push(keyword);
                let responses = keywordResponses[keywordGroup];

                if (responses && responses[selectedTone]) {
                    let formattedResponses = Array.isArray(responses[selectedTone])
                        ? responses[selectedTone]  // Already an array
                        : [responses[selectedTone]]; // Convert string to array if needed

                    detectedResponses = detectedResponses.concat(formattedResponses);
                }
            }
        }
    }

    console.log("Detected keywords:", detectedKeywords);
    console.log("Collected responses:", detectedResponses);

    return { detectedKeywords, suggestions: detectedResponses };
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

// Display keyword matches as buttons (preserving existing styles)
function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = ""; // Clear previous suggestions

    if (!Array.isArray(suggestions)) {
        console.error("Invalid suggestions format:", suggestions);
        suggestionsDiv.innerHTML = "<p class='no-keywords'>Error loading responses.</p>";
        return;
    }

    if (suggestions.length > 0) {
        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add("suggestions-container"); // Keeps styling intact

        suggestions.forEach(response => {
            if (typeof response !== "string") {
                console.error("Invalid response format:", response);
                return;
            }

            let btn = document.createElement("button");
            btn.classList.add("suggestion-button"); // Maintain button styling
            btn.textContent = response;
            btn.addEventListener("click", () => {
                navigator.clipboard.writeText(response).then(() => {
                    btn.textContent = "Copied!";
                    setTimeout(() => { btn.textContent = response; }, 1500);
                });
            });
            buttonContainer.appendChild(btn);
        });

        suggestionsDiv.appendChild(buttonContainer);
    } else {
        suggestionsDiv.innerHTML = "<p class='no-keywords'>No keyword matches found for this tone.</p>";
    }
}
