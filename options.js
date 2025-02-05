document.addEventListener("DOMContentLoaded", function () {
    initializeKeywordMappings();
    loadKeywordMappings();
    document.getElementById("saveMapping").addEventListener("click", saveKeywordMapping);
    document.getElementById("resetMappings").addEventListener("click", resetToDefaultMappings);

    const keywordInput = document.getElementById("keywordInput");
    const keywordContainer = document.getElementById("keywordContainer");

    keywordInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && keywordInput.value.trim() !== "") {
            event.preventDefault();
            addKeywordTag(keywordInput.value.trim());
            keywordInput.value = "";
        }
    });
});

// Store keywords as an array
let keywords = [];

// Function to add keyword tags
function addKeywordTag(keyword) {
    if (!keywords.includes(keyword)) {
        keywords.push(keyword);
        updateKeywordUI();
    }
}

// Function to update keyword UI
function updateKeywordUI() {
    const keywordContainer = document.getElementById("keywordContainer");
    keywordContainer.innerHTML = `<input type="text" id="keywordInput" placeholder="Enter keywords (Press Enter)">`;

    keywords.forEach(keyword => {
        let span = document.createElement("span");
        span.classList.add("keyword-tag");
        span.textContent = keyword;

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✖";
        deleteBtn.addEventListener("click", function () {
            keywords = keywords.filter(k => k !== keyword);
            updateKeywordUI();
        });

        span.appendChild(deleteBtn);
        keywordContainer.insertBefore(span, keywordContainer.lastChild);
    });

    document.getElementById("keywordInput").addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && this.value === "" && keywords.length > 0) {
            keywords.pop();
            updateKeywordUI();
        }
    });
}

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
    let friendlyResponse = document.getElementById("friendlyResponse").value.trim();
    let neutralResponse = document.getElementById("neutralResponse").value.trim();
    let damnCBResponse = document.getElementById("damnCBResponse").value.trim();

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
                keywords = [];
                updateKeywordUI();
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
                <strong>${keyword}</strong><br>
                🟢 Friendly: ${responses.friendly} <br>
                🟡 Neutral: ${responses.neutral} <br>
                🔴 Damn CB: ${responses.damnCB}
                <button class="delete-btn">❌ Delete</button>
            `;

            let deleteBtn = li.querySelector(".delete-btn");
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
