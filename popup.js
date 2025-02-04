document.addEventListener("DOMContentLoaded", function () {
    const detectBtn = document.getElementById("detectBtn");
    const textArea = document.getElementById("selectedText");
    const suggestionsDiv = document.getElementById("suggestions");

    // Function to get highlighted text
    async function getHighlightedText() {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        let result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        return result[0].result || "";
    }

    // Detect keywords and suggest responses
    detectBtn.addEventListener("click", async () => {
        let selectedText = await getHighlightedText();
        textArea.value = selectedText;

        let suggestions = generateSuggestions(selectedText);
        displaySuggestions(suggestions);
    });

    // Define keyword-based suggestions
    function generateSuggestions(text) {
        const keywordResponses = {
            "price": "The price is negotiable.",
            "available": "Yes, this item is still available!",
            "meetup": "I prefer to do meetups at MRT stations.",
            "shipping": "I can ship via courier for an additional fee.",
            "payment": "I accept PayNow and bank transfers."
        };

        let detectedSuggestions = [];
        for (let keyword in keywordResponses) {
            if (text.toLowerCase().includes(keyword)) {
                detectedSuggestions.push(keywordResponses[keyword]);
            }
        }
        return detectedSuggestions;
    }

    // Display the suggestions in the popup
    function displaySuggestions(suggestions) {
        suggestionsDiv.innerHTML = "";
        if (suggestions.length === 0) {
            suggestionsDiv.innerHTML = "<p>No keyword matches found.</p>";
        } else {
            suggestions.forEach(response => {
                let p = document.createElement("p");
                p.textContent = response;
                p.style.cursor = "pointer";
                p.style.background = "#f1f1f1";
                p.style.padding = "5px";
                p.style.borderRadius = "5px";
                p.style.margin = "5px 0";
                p.addEventListener("click", () => {
                    navigator.clipboard.writeText(response);
                    alert("Copied: " + response);
                });
                suggestionsDiv.appendChild(p);
            });
        }
    }
});
