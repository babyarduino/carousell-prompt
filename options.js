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
            "Yes! It's definitely available! 😊 To reserve it for you, just let me know when you'd like to collect it.",
            "Sorry, no! 😔 Someone reserved it before you did. I'll let you know if anything changes!",
        ],
        neutral: [
            "Yes, let me know your collection timing to reserve.",
            "Nope, will update you if anything changes.",
        ],
        damnCB: [
            "Still have!",
            "Choped already. Will update.",
        ]
    },
    "interested, would like, would love, will like, will love, reserve, hold": {
        friendly: [
            "Let me know a date and time, or if you'd like it posted, and I'll reserve the item for you. Please ensure you've read the item condition and any defects, along with my conditions.",
        ],
        neutral: [
            "Confirm ur collection date/time or if you'd like it posted, and I'll reserve it. Please review the item condition and my terms.",
        ],
        damnCB: [
            "Can. LMK timing/mail to reserve."
        ]
    },
    "nego, negotiation, lower price": {
        friendly: [ 
            "I totally understand! I'm happy to work something out. Let me know your offer, and we can discuss! 😊", 
        ],
        neutral: [ 
            "I'll consider, lmk what you have in mind. :)", 
        ],
        damnCB: [ 
            "U interested anot? Price alr good la."
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
        // First ensure the styles exist
        if (!document.querySelector('style[data-popup-styles]')) {
            const style = document.createElement('style');
            style.setAttribute('data-popup-styles', '');
            style.textContent = `
                .reset-popup {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .reset-popup-content {
                    background: white;
                    padding: 24px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    width: 90%;
                }

                .reset-popup-content h3 {
                    margin: 0 0 16px 0;
                    color: #333;
                    font-size: 18px;
                }

                .reset-popup-content p {
                    margin: 0 0 20px 0;
                    color: #666;
                    font-size: 14px;
                }

                .reset-popup-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .reset-popup-buttons button {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    border: none;
                }

                #cancelSave {
                    background: #f5f5f5;
                    color: #666;
                }

                #confirmSave {
                    background: #e61e3d;
                    color: white;
                }

                #cancelSave:hover {
                    background: #eee;
                }

                #confirmSave:hover {
                    background: #d41834;
                }
            `;
            document.head.appendChild(style);
        }

        const popup = document.createElement('div');
        popup.className = 'reset-popup';
        popup.innerHTML = `
            <div class="reset-popup-content">
                <h3>Missing Responses</h3>
                <p>Please provide at least one response for each tone level.</p>
                <div class="reset-popup-buttons">
                    <button id="cancelSave">Cancel</button>
                    <button id="confirmSave">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Handle button clicks
        document.getElementById('cancelSave').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        document.getElementById('confirmSave').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        // Close popup when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                document.body.removeChild(popup);
            }
        });

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
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[0] || '' : responses.friendly || ''}" 
                                    class="response-input friendly" data-index="0" placeholder="Friendly response 1">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[1] || '' : ''}" 
                                    class="response-input friendly" data-index="1" placeholder="Friendly response 2">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.friendly) ? responses.friendly[2] || '' : ''}" 
                                    class="response-input friendly" data-index="2" placeholder="Friendly response 3">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                        </div>
                    </div>
                    <div class="tone-section">
                        <label>Neutral Responses</label>
                        <div class="response-list">
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[0] || '' : responses.neutral || ''}" 
                                    class="response-input neutral" data-index="0" placeholder="Neutral response 1">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[1] || '' : ''}" 
                                    class="response-input neutral" data-index="1" placeholder="Neutral response 2">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.neutral) ? responses.neutral[2] || '' : ''}" 
                                    class="response-input neutral" data-index="2" placeholder="Neutral response 3">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                        </div>
                    </div>
                    <div class="tone-section">
                        <label>Casual Responses</label>
                        <div class="response-list">
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[0] || '' : responses.damnCB || ''}" 
                                    class="response-input damnCB" data-index="0" placeholder="Casual response 1">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[1] || '' : ''}" 
                                    class="response-input damnCB" data-index="1" placeholder="Casual response 2">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
                            <div class="response-input-group">
                                <input type="text" value="${Array.isArray(responses.damnCB) ? responses.damnCB[2] || '' : ''}" 
                                    class="response-input damnCB" data-index="2" placeholder="Casual response 3">
                                <button class="copy-btn" title="Copy to clipboard">📋</button>
                            </div>
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

            // Add copy button event listeners
            li.querySelectorAll('.copy-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const input = this.previousElementSibling;
                    const text = input.value;
                    if (text) {
                        navigator.clipboard.writeText(text).then(() => {
                            // Visual feedback
                            const originalText = this.textContent;
                            this.textContent = '✓';
                            this.style.backgroundColor = '#4CAF50';
                            this.style.color = 'white';
                            
                            setTimeout(() => {
                                this.textContent = originalText;
                                this.style.backgroundColor = '';
                                this.style.color = '';
                            }, 1000);
                        });
                    }
                });
            });

            keywordList.appendChild(li);
        });
    });
}

// Reset to default mappings
function resetToDefaultMappings() {
    // Create and style the popup
    const popup = document.createElement('div');
    popup.className = 'reset-popup';
    popup.innerHTML = `
        <div class="reset-popup-content">
            <h3>Reset to Default Mappings</h3>
            <p>Are you sure? This will remove all custom mappings.</p>
            <div class="reset-popup-buttons">
                <button id="cancelReset">Cancel</button>
                <button id="confirmReset">Reset</button>
            </div>
        </div>
    `;

    // Add the popup styles to options.html
    const style = document.createElement('style');
    style.textContent = `
        .reset-popup {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .reset-popup-content {
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
        }

        .reset-popup-content h3 {
            margin: 0 0 16px 0;
            color: #333;
            font-size: 18px;
        }

        .reset-popup-content p {
            margin: 0 0 20px 0;
            color: #666;
            font-size: 14px;
        }

        .reset-popup-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .reset-popup-buttons button {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            border: none;
        }

        #cancelReset {
            background: #f5f5f5;
            color: #666;
        }

        #confirmReset {
            background: #e61e3d;
            color: white;
        }

        #cancelReset:hover {
            background: #eee;
        }

        #confirmReset:hover {
            background: #d41834;
        }
    `;
    document.head.appendChild(style);

    // Add the popup to the page
    document.body.appendChild(popup);

    // Handle button clicks
    document.getElementById('cancelReset').addEventListener('click', () => {
        document.body.removeChild(popup);
    });

    document.getElementById('confirmReset').addEventListener('click', () => {
        chrome.storage.sync.set({ mappings: defaultMappings }, () => {
            loadKeywordMappings();
            document.body.removeChild(popup);
        });
    });

    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}