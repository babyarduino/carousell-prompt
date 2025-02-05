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

// Initialize storage with default mappings if empty
function initializeKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        if (!data.mappings || Object.keys(data.mappings).length === 0) {
            chrome.storage.sync.set({ mappings: defaultMappings });
        }
    });
}

// Save new keyword mapping
function saveKeywordMapping() {
    let keywordInput = document.getElementById("keywordInput").value.trim();
    let friendlyResponse = document.getElementById("friendlyResponse").value.trim();
    let neutralResponse = document.getElementById("neutralResponse").value.trim();
    let damnCBResponse = document.getElementById("damnCBResponse").value.trim();

    let keywords = keywordInput.split(",").map(k => k.trim()).filter(k => k !== "");

    if (keywords.length > 0 && friendlyResponse && neutralResponse && damnCBResponse) {
        chrome.storage.sync.get("mappings", (data) => {
            let mappings = data.mappings || {};
            mappings[keywords.join(", ")] = {
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
        alert("Please enter at least one keyword and responses for all fields.");
    }
}

// Load and display stored keyword mappings (with edit, save, and delete)
function loadKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        let keywordList = document.getElementById("keywordList");
        keywordList.innerHTML = "";

        let mappings = data.mappings || {};
        for (let keyword in mappings) {
            let responses = mappings[keyword];

            let li = document.createElement("li");
            li.innerHTML = `
                <div class="keyword-container">
                    ${keyword.split(", ").map(k => `<span class="keyword-tag">${k} <button class="delete-keyword" data-keyword="${k}">✖</button></span>`).join("")}
                </div>
                <input type="text" value="${responses.friendly}" class="edit-friendly">
                <input type="text" value="${responses.neutral}" class="edit-neutral">
                <input type="text" value="${responses.damnCB}" class="edit-damnCB">
                <button class="save-btn">💾 Save</button>
                <button class="delete-btn">❌ Delete</button>
            `;

            let saveBtn = li.querySelector(".save-btn");
            let deleteBtn = li.querySelector(".delete-btn");

            let friendlyInput = li.querySelector(".edit-friendly");
            let neutralInput = li.querySelector(".edit-neutral");
            let damnCBInput = li.querySelector(".edit-damnCB");

            // Save edited response
            saveBtn.addEventListener("click", () => {
                let updatedFriendly = friendlyInput.value.trim();
                let updatedNeutral = neutralInput.value.trim();
                let updatedDamnCB = damnCBInput.value.trim();

                if (updatedFriendly && updatedNeutral && updatedDamnCB) {
                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = data.mappings || {};
                        mappings[keyword] = {
                            friendly: updatedFriendly,
                            neutral: updatedNeutral,
                            damnCB: updatedDamnCB
                        };
                        chrome.storage.sync.set({ mappings }, loadKeywordMappings);
                    });
                } else {
                    alert("All responses must be filled out before saving.");
                }
            });

            deleteBtn.addEventListener("click", () => deleteKeywordMapping(keyword));

            keywordList.appendChild(li);
        }
    });
}

// Delete a keyword mapping
function deleteKeywordMapping(keyword) {
    chrome.storage.sync.get("mappings", (data) => {
        let mappings = data.mappings || {};
        delete mappings[keyword];
        chrome.storage.sync.set({ mappings }, loadKeywordMappings);
    });
}

// Reset to default mappings
function resetToDefaultMappings() {
    chrome.storage.sync.set({ mappings: defaultMappings }, () => {
        loadKeywordMappings();
        alert("Keyword mappings have been reset to default!");
    });
}
