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
        damnCB: "Can."
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
    let friendlyResponse = document.getElementById("friendlyResponse").value.trim();
    let neutralResponse = document.getElementById("neutralResponse").value.trim();
    let damnCBResponse = document.getElementById("damnCBResponse").value.trim();

    let keywords = keywordInput.split(",").map(k => k.trim()).filter(k => k !== "");
    let uniqueID = `entry-${Date.now()}`; // Unique ID for empty keyword entries

    if (friendlyResponse && neutralResponse && damnCBResponse) {
        chrome.storage.sync.get("mappings", (data) => {
            let mappings = data.mappings || {};
            let key = keywords.length > 0 ? keywords.join(", ") : uniqueID; // Ensure unique empty keyword groups
            mappings[key] = {
                friendly: friendlyResponse,
                neutral: neutralResponse,
                damnCB: damnCBResponse
            };
            chrome.storage.sync.set({ mappings }, () => {
                loadKeywordMappings();
                document.getElementById("keywordInput").value = "";
                document.getElementById("friendlyResponse").value = "";
                document.getElementById("neutralResponse").value = "";
                document.getElementById("damnCBResponse").value = "";
            });
        });
    } else {
        alert("All response fields must be filled.");
    }
}

// Load and display stored keyword mappings (ensures defaults appear unless removed)
function loadKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        let mappings = data.mappings || {};

        // If all mappings have been deleted, restore defaults
        if (Object.keys(mappings).length === 0) {
            mappings = { ...defaultMappings };
            chrome.storage.sync.set({ mappings });
        }

        let keywordList = document.getElementById("keywordList");
        keywordList.innerHTML = "";

        Object.entries(mappings).forEach(([keywordGroup, responses]) => {
            let keywords = keywordGroup.startsWith("entry-") ? [] : keywordGroup.split(", ").filter(k => k !== "");

            let li = document.createElement("li");
            li.innerHTML = `
                <div class="keyword-container">
                    ${keywords.map(k => `
                        <span class="keyword-tag">
                            ${k}
                            <button class="delete-tag" data-keyword="${k}" data-group="${keywordGroup}">×</button>
                        </span>
                    `).join("")}
                    ${keywords.length === 0 ? '<span class="empty-keywords">No keywords - click Save to add new ones</span>' : ''}
                    <input type="text" class="new-keyword-input" placeholder="Add keyword (Enter)">
                </div>
                <input type="text" value="${responses.friendly}" class="edit-friendly">
                <input type="text" value="${responses.neutral}" class="edit-neutral">
                <input type="text" value="${responses.damnCB}" class="edit-damnCB">
                <button class="save-btn">Save</button>
                <button class="delete-btn">Delete Group</button>
            `;

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

            // Save button event listener
            li.querySelector(".save-btn").addEventListener("click", () => {
                let updatedFriendly = li.querySelector(".edit-friendly").value.trim();
                let updatedNeutral = li.querySelector(".edit-neutral").value.trim();
                let updatedDamnCB = li.querySelector(".edit-damnCB").value.trim();

                if (updatedFriendly && updatedNeutral && updatedDamnCB) {
                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = { ...data.mappings };
                        mappings[keywordGroup] = {
                            friendly: updatedFriendly,
                            neutral: updatedNeutral,
                            damnCB: updatedDamnCB
                        };
                        chrome.storage.sync.set({ mappings }, loadKeywordMappings);
                    });
                } else {
                    alert("All responses must be filled before saving.");
                }
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
