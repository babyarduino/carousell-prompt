document.addEventListener("DOMContentLoaded", function () {
    initializeKeywordMappings();
    loadKeywordMappings();
    document.getElementById("saveMapping").addEventListener("click", saveKeywordMapping);
    document.getElementById("resetMappings").addEventListener("click", resetToDefaultMappings);
});

// Pre-set keyword mappings
const defaultMappings = {
    "available, availability": {
        friendly: [
            "Yes! It's definitely available!:) To reserve the item, please let me know.",
            "Sorry, no :( Someone choped it before you did! I'll let you know if anything changes.",
        ],
        neutral: [
            "Yes, lmk your collection timing to reserve.",
            "Nope. Will update u if anything changes.",
        ],
        damnCB: [
            "Yup.",
            "Nope.",
        ]
    },
    "interested, would like, would love": {
        friendly: "Sure! Let me know a date and time to reserve the item for you!",
        neutral: "OK. Pls update me timing for collection to reserve.",
        damnCB: "LMK your pick-up timing to reserve item."
    },
    "need, want": {
        friendly: [ "Kindly read the description section of my item listing again, thanks!", ],
        neutral: [ "Pls read item description thx.", ],
        damnCB: [ 
            "Want your mother la.",
            "Need ur mother la.",
         ]
    }
};

// Ensure default mappings load unless manually deleted
function initializeKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        let mappings = data.mappings || {};
        if (Object.keys(mappings).length === 0) {
            chrome.storage.sync.set({ mappings: defaultMappings }, loadKeywordMappings);
        } else {
            loadKeywordMappings();
        }
    });
}

// Save new keyword mapping (supports empty keywords)
function saveKeywordMapping() {
    // Get the input values
    const keywordInput = document.getElementById("keywordInput");
    if (!keywordInput) {
        console.error("Keyword input not found");
        return;
    }

    // Get responses for each tone
    const friendlyResponses = [];
    const neutralResponses = [];
    const damnCBResponses = [];

    // Collect friendly responses
    for (let i = 1; i <= 3; i++) {
        const response = document.getElementById(`friendlyResponse${i}`);
        if (response && response.value.trim()) {
            friendlyResponses.push(response.value.trim());
        }
    }

    // Collect neutral responses
    for (let i = 1; i <= 3; i++) {
        const response = document.getElementById(`neutralResponse${i}`);
        if (response && response.value.trim()) {
            neutralResponses.push(response.value.trim());
        }
    }

    // Collect casual responses
    for (let i = 1; i <= 3; i++) {
        const response = document.getElementById(`damnCBResponse${i}`);
        if (response && response.value.trim()) {
            damnCBResponses.push(response.value.trim());
        }
    }

    // Validate responses
    if (friendlyResponses.length === 0 || neutralResponses.length === 0 || damnCBResponses.length === 0) {
        alert("Please provide at least one response for each tone level.");
        return;
    }

    // Process keywords
    const keywords = keywordInput.value.trim().split(",")
        .map(k => k.trim())
        .filter(k => k !== "");
    
    const uniqueID = `entry-${Date.now()}`;
    const key = keywords.length > 0 ? keywords.join(", ") : uniqueID;

    // Save to storage
    chrome.storage.sync.get("mappings", (data) => {
        const mappings = data.mappings || {};
        mappings[key] = {
            friendly: friendlyResponses,
            neutral: neutralResponses,
            damnCB: damnCBResponses
        };

        chrome.storage.sync.set({ mappings }, () => {
            // Clear all input fields
            keywordInput.value = "";
            
            // Clear response fields
            for (let i = 1; i <= 3; i++) {
                const elements = [
                    document.getElementById(`friendlyResponse${i}`),
                    document.getElementById(`neutralResponse${i}`),
                    document.getElementById(`damnCBResponse${i}`)
                ];
                
                elements.forEach(el => {
                    if (el) el.value = "";
                });
            }

            // Reload the keyword list
            loadKeywordMappings();
        });
    });
}

// Load and display stored keyword mappings (ensures defaults appear unless removed)
function loadKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        let keywordList = document.getElementById("keywordList");
        keywordList.innerHTML = "";

        let mappings = data.mappings || {};
        Object.entries(mappings).forEach(([keywordGroup, responses]) => {
            let keywords = keywordGroup.split(", ").filter(k => k !== "");

            let li = document.createElement("li");
            li.innerHTML = `
                <div class="keyword-container">
                    ${keywords.map(k => `
                        <span class="keyword-tag">
                            ${k}
                            <button class="delete-tag" data-keyword="${k}" data-group="${keywordGroup}">×</button>
                        </span>
                    `).join("")}
                    <input type="text" class="new-keyword-input" placeholder="Add keyword" data-group="${keywordGroup}">
                    ${keywords.length === 0 ? '<span class="empty-keywords">No keywords - click Save to add new ones</span>' : ''}
                </div>
                <div class="responses-container">
                    <div class="tone-section">
                        <label>Friendly Responses</label>
                        <div class="response-list">
                            <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[0] || '' : responses.friendly || ''}" 
                                class="response-input friendly" data-index="0" placeholder="Friendly response 1">
                            <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[1] || '' : ''}" 
                                class="response-input friendly" data-index="1" placeholder="Friendly response 2">
                            <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[2] || '' : ''}" 
                                class="response-input friendly" data-index="2" placeholder="Friendly response 3">
                        </div>
                    </div>
                    <div class="tone-section">
                        <label>Neutral Responses</label>
                        <div class="response-list">
                            <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[0] || '' : responses.neutral || ''}" 
                                class="response-input neutral" data-index="0" placeholder="Neutral response 1">
                            <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[1] || '' : ''}" 
                                class="response-input neutral" data-index="1" placeholder="Neutral response 2">
                            <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[2] || '' : ''}" 
                                class="response-input neutral" data-index="2" placeholder="Neutral response 3">
                        </div>
                    </div>
                    <div class="tone-section">
                        <label>Casual Responses</label>
                        <div class="response-list">
                            <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[0] || '' : responses.damnCB || ''}" 
                                class="response-input damnCB" data-index="0" placeholder="Casual response 1">
                            <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[1] || '' : ''}" 
                                class="response-input damnCB" data-index="1" placeholder="Casual response 2">
                            <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[2] || '' : ''}" 
                                class="response-input damnCB" data-index="2" placeholder="Casual response 3">
                        </div>
                    </div>
                </div>
                <div class="button-container">
                    <button class="delete-btn">Remove</button>
                </div>
            `;

            // Add event listener for response changes
            li.querySelectorAll('.response-input').forEach(input => {
                input.addEventListener('change', function() {
                    const tone = this.classList[1]; // friendly, neutral, or damnCB
                    const responseList = this.closest('.response-list');
                    const responses = Array.from(responseList.querySelectorAll('.response-input'))
                        .map(input => input.value.trim())
                        .filter(value => value !== '');

                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = { ...data.mappings };
                        mappings[keywordGroup][tone] = responses;
                        chrome.storage.sync.set({ mappings });
                    });
                });
            });

            // Allow adding new keywords
            let newKeywordInput = li.querySelector(".new-keyword-input");
            newKeywordInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    let newKeyword = newKeywordInput.value.trim();
                    if (newKeyword) {
                        chrome.storage.sync.get("mappings", (data) => {
                            let mappings = { ...data.mappings };
                            let updatedKeywords = keywords.concat(newKeyword).join(", ");
                            mappings[updatedKeywords] = responses;
                            delete mappings[keywordGroup];
                            chrome.storage.sync.set({ mappings }, loadKeywordMappings);
                        });
                    }
                }
            });

            // Allow deleting individual keywords
            li.querySelectorAll('.delete-tag').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const keyword = this.getAttribute('data-keyword');
                    const group = this.getAttribute('data-group');
                    
                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = { ...data.mappings };
                        let keywords = group.split(", ").filter(k => k !== keyword);
                        
                        if (keywords.length === 0) {
                            // If no keywords left, keep the existing entry with its current key
                            // This prevents the error- prefix from appearing
                            mappings[group] = mappings[group];
                        } else {
                            // If there are remaining keywords, update the key
                            const newKey = keywords.join(", ");
                            if (newKey !== group) {
                                mappings[newKey] = mappings[group];
                                delete mappings[group];
                            }
                        }
                        
                        chrome.storage.sync.set({ mappings }, () => {
                            loadKeywordMappings();
                        });
                    });
                });
            });

            // Delete button event listener
            li.querySelector(".delete-btn").addEventListener("click", () => {
                chrome.storage.sync.get("mappings", (data) => {
                    let mappings = { ...data.mappings };
                    delete mappings[keywordGroup];
                    chrome.storage.sync.set({ mappings }, loadKeywordMappings);
                });
            });

            keywordList.appendChild(li);
        });
    });
}

// Reset to default mappings
function resetToDefaultMappings() {
    chrome.storage.sync.set({ mappings: defaultMappings }, () => {
        loadKeywordMappings();
        alert("Keyword mappings have been reset to default!");
    });
}