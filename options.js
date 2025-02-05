document.addEventListener("DOMContentLoaded", function () {
    initializeKeywordMappings();
    loadKeywordMappings();
    document.getElementById("saveMapping").addEventListener("click", saveKeywordMapping);
    document.getElementById("resetMappings").addEventListener("click", resetToDefaultMappings);
});

// Pre-set keyword mappings
const defaultMappings = {
    "price, offer, $": {
        friendly: "You got a deal!",
        neutral: "Sure.",
        damnCB: "KCan."
    },
    "interested, would like, would love": {
        friendly: "Sure! Let me know a date and time to reserve the item for you!",
        neutral: "OK. Pls update me timing for collection to reserve.",
        damnCB: "LMK your pick-up timing to reserve item."
    },
    "need, want": {
        friendly: "Kindly read the description section of my item listing again, thanks!",
        neutral: "Pls read item description thx.",
        damnCB: "I want your mother la."
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
    let keywordInput = document.getElementById("keywordInput").value.trim();
    let friendlyResponses = [
        document.getElementById("friendlyResponse1").value.trim(),
        document.getElementById("friendlyResponse2").value.trim(),
        document.getElementById("friendlyResponse3").value.trim()
    ].filter(r => r !== "");
    
    let neutralResponses = [
        document.getElementById("neutralResponse1").value.trim(),
        document.getElementById("neutralResponse2").value.trim(),
        document.getElementById("neutralResponse3").value.trim()
    ].filter(r => r !== "");
    
    let damnCBResponses = [
        document.getElementById("damnCBResponse1").value.trim(),
        document.getElementById("damnCBResponse2").value.trim(),
        document.getElementById("damnCBResponse3").value.trim()
    ].filter(r => r !== "");

    let keywords = keywordInput.split(",").map(k => k.trim()).filter(k => k !== "");
    let uniqueID = `entry-${Date.now()}`;

    if (friendlyResponses.length > 0 && neutralResponses.length > 0 && damnCBResponses.length > 0) {
        chrome.storage.sync.get("mappings", (data) => {
            let mappings = data.mappings || {};
            let key = keywords.length > 0 ? keywords.join(", ") : uniqueID;
            mappings[key] = {
                friendly: friendlyResponses,
                neutral: neutralResponses,
                damnCB: damnCBResponses
            };
            chrome.storage.sync.set({ mappings }, () => {
                loadKeywordMappings();
                // Clear all input fields
                document.getElementById("keywordInput").value = "";
                ["friendly", "neutral", "damnCB"].forEach(tone => {
                    for (let i = 1; i <= 3; i++) {
                        document.getElementById(`${tone}Response${i}`).value = "";
                    }
                });
            });
        });
    } else {
        alert("At least one response for each tone must be filled.");
    }
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
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const keywordToDelete = button.dataset.keyword;
                    const originalGroup = button.dataset.group;

                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = { ...data.mappings };
                        let responses = mappings[originalGroup];

                        let remainingKeywords = originalGroup.split(", ").filter(k => k !== "" && k !== keywordToDelete);
                        let newGroup = remainingKeywords.length > 0 ? remainingKeywords.join(", ") : `entry-${Date.now()}`; // Unique ID for empty groups

                        mappings[newGroup] = responses;
                        delete mappings[originalGroup];
                        chrome.storage.sync.set({ mappings }, loadKeywordMappings);
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