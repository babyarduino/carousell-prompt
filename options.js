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
    let keyword = document.getElementById("newKeyword").value.trim();
    let friendlyResponse = document.getElementById("friendlyResponse").value.trim();
    let neutralResponse = document.getElementById("neutralResponse").value.trim();
    let damnCBResponse = document.getElementById("damnCBResponse").value.trim();

    if (keyword && friendlyResponse && neutralResponse && damnCBResponse) {
        chrome.storage.sync.get("mappings", (data) => {
            let mappings = data.mappings || {};
            mappings[keyword] = {
                friendly: friendlyResponse,
                neutral: neutralResponse,
                damnCB: damnCBResponse
            };
            chrome.storage.sync.set({ mappings }, () => {
                loadKeywordMappings();
                document.getElementById("newKeyword").value = "";
                document.getElementById("friendlyResponse").value = "";
                document.getElementById("neutralResponse").value = "";
                document.getElementById("damnCBResponse").value = "";
            });
        });
    }
}

// Load and display stored keyword mappings
function loadKeywordMappings() {
    chrome.storage.sync.get("mappings", (data) => {
        let keywordList = document.getElementById("keywordList");
        keywordList.innerHTML = "";

        let mappings = data.mappings || {};
        for (let keyword in mappings) {
            let responses = mappings[keyword];

            let li = document.createElement("li");
            li.innerHTML = `
                <input type="text" value="${keyword}" class="edit-keyword" disabled>
                <input type="text" value="${responses.friendly}" class="edit-friendly" disabled>
                <input type="text" value="${responses.neutral}" class="edit-neutral" disabled>
                <input type="text" value="${responses.damnCB}" class="edit-damnCB" disabled>
                <button class="edit-btn">✏️ Edit</button>
                <button class="save-btn">💾 Save</button>
                <button class="delete-btn">❌ Delete</button>
            `;

            let editBtn = li.querySelector(".edit-btn");
            let saveBtn = li.querySelector(".save-btn");
            let deleteBtn = li.querySelector(".delete-btn");
            let keywordInput = li.querySelector(".edit-keyword");
            let friendlyInput = li.querySelector(".edit-friendly");
            let neutralInput = li.querySelector(".edit-neutral");
            let damnCBInput = li.querySelector(".edit-damnCB");

            // Enable editing mode
            editBtn.addEventListener("click", () => {
                keywordInput.disabled = false;
                friendlyInput.disabled = false;
                neutralInput.disabled = false;
                damnCBInput.disabled = false;
                editBtn.style.display = "none";
                saveBtn.style.display = "inline-block";
            });

            // Save edited response
            saveBtn.addEventListener("click", () => {
                let updatedKeyword = keywordInput.value.trim();
                let updatedFriendly = friendlyInput.value.trim();
                let updatedNeutral = neutralInput.value.trim();
                let updatedDamnCB = damnCBInput.value.trim();

                if (updatedKeyword && updatedFriendly && updatedNeutral && updatedDamnCB) {
                    chrome.storage.sync.get("mappings", (data) => {
                        let mappings = data.mappings || {};
                        delete mappings[keyword]; // Remove old key
                        mappings[updatedKeyword] = {
                            friendly: updatedFriendly,
                            neutral: updatedNeutral,
                            damnCB: updatedDamnCB
                        };
                        chrome.storage.sync.set({ mappings }, loadKeywordMappings);
                    });
                }
            });

            // Delete keyword mapping
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
