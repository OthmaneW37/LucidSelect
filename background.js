// background.js - Service Worker for LucidSelect

// Context Menu Setup
chrome.runtime.onInstalled.addListener(() => {
  // Main Menu
  chrome.contextMenus.create({
    id: "lucidSelectMenu",
    title: "LucidSelect",
    contexts: ["selection"]
  });

  // Sub-items
  const menuItems = [
    { id: "answerQuestion", title: "Répondre à cette question" },
    { id: "paraphrase", title: "Paraphraser" },
    { id: "summarize", title: "Résumer" },
    { id: "analyzeQCM", title: "Analyser QCM/Quiz" },
    { id: "askChatGPT", title: "Poser une question sur la sélection..." },
    { id: "openChatGPT", title: "Ouvrir dans ChatGPT" }
  ];

  menuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: "lucidSelectMenu",
      title: item.title,
      contexts: ["selection"]
    });
  });
});

// History Helper
async function saveToHistory(question, answer, apiName) {
  try {
    const data = await chrome.storage.local.get(['request_history']);
    let history = data.request_history || [];

    // Create new entry
    const newEntry = {
      timestamp: Date.now(),
      question: question.substring(0, 100) + (question.length > 100 ? '...' : ''), // Truncate for preview
      answer: answer,
      api: apiName
    };

    // Add to beginning
    history.unshift(newEntry);

    // Limit to 50 items
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    await chrome.storage.local.set({ request_history: history });
  } catch (err) {
    console.error("Failed to save history", err);
  }
}

// Handle Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;

  const actions = {
    askChatGPT: () => sendMessage(tab.id, "showPromptPopup", { selection: info.selectionText }),
    answerQuestion: () => sendMessage(tab.id, "directQuery", { selection: info.selectionText, prompt: "Réponds à cette question" }),
    paraphrase: () => sendMessage(tab.id, "directQuery", { selection: info.selectionText, prompt: "Paraphrase ce texte" }),
    summarize: () => sendMessage(tab.id, "directQuery", { selection: info.selectionText, prompt: "Résume ce texte" }),
    analyzeQCM: () => sendMessage(tab.id, "directQuery", {
      selection: info.selectionText,
      prompt: "Identifie la ou les bonnes réponses. Explique brièvement."
    }),
    openChatGPT: () => {
      const encodedText = btoa(unescape(encodeURIComponent(info.selectionText)));
      chrome.tabs.create({ url: `https://chat.openai.com/chat?text=${encodedText}` });
    }
  };

  if (actions[info.menuItemId]) {
    actions[info.menuItemId]();
  }
});

function sendMessage(tabId, action, data = {}) {
  chrome.tabs.sendMessage(tabId, { action, ...data }).catch(err => {
    console.log("Could not send message to tab (maybe content script not loaded yet?)", err);
  });
}

// Handle Keyboard Shortcuts
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "ask_question") {
    chrome.tabs.sendMessage(tab.id, { action: "getSelectionAndShowPopup" });
  } else if (command === "answer_selected_question") {
    chrome.tabs.sendMessage(tab.id, { action: "directQuery", prompt: "Réponds à cette question" });
  } else if (command === "open_chat_gpt") {
    chrome.tabs.sendMessage(tab.id, { action: "getSelection" }, (response) => {
      if (response && response.text) {
        const encodedText = btoa(unescape(encodeURIComponent(response.text)));
        chrome.tabs.create({ url: `https://chat.openai.com/chat?text=${encodedText}` });
      }
    });
  }
});

// Handle Messages from Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getApiKey") {
    chrome.storage.local.get(["openai_api_key"], (result) => {
      sendResponse({ apiKey: result.openai_api_key || "" });
    });
    return true; // Use async response
  }

  if (request.action === "queryChatGPT") {
    handleQuery(request, sendResponse);
    return true; // Use async response
  }
});

async function handleQuery(request, sendResponse) {
  try {
    const result = await chrome.storage.local.get([
      "openai_api_key", "together_api_key", "claude_api_key", "gemini_api_key", "selected_api"
    ]);

    const selectedApi = result.selected_api || "openai";
    let apiKey = result[`${selectedApi}_api_key`];

    let apiUrl = "";
    let apiHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    let apiBody = {};

    // API Configurations
    if (selectedApi === "openai") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      apiBody = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un assistant utile et concis." },
          { role: "user", content: `Texte: "${request.selection}".\n\nDemande: ${request.question}` }
        ],
        max_tokens: 500
      };
    } else if (selectedApi === "together") {
      apiUrl = "https://api.together.xyz/v1/chat/completions";
      apiBody = {
        model: "mistralai/Mistral-7B-Instruct-v0.1",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: `Texte: "${request.selection}".\n\nDemande: ${request.question}` }
        ]
      };
    }
    // Add logic for Claude/Gemini if needed later, keeping it simple for now to match verified APIs

    if (!apiKey) {
      sendResponse({ success: false, error: `Clé API ${selectedApi} manquante.` });
      return;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify(apiBody)
    });

    if (!response.ok) {
      let errMessage = `Erreur API: ${response.status}`;
      if (response.status === 429) errMessage = "Trop de requêtes (429). Vérifiez votre quota.";
      else if (response.status === 401) errMessage = "Non autorisé (401). Vérifiez votre clé API.";
      throw new Error(errMessage);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    // SAVE HISTORY
    await saveToHistory(request.question || "Analyse", answer, selectedApi);

    sendResponse({ success: true, answer: answer });

  } catch (error) {
    console.error("Query Error:", error);
    sendResponse({ success: false, error: error.message });
  }
}