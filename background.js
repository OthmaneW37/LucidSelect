// background.js - Script de fond pour LucidSelect

// Création du menu contextuel qui apparaît lors de la sélection de texte
chrome.runtime.onInstalled.addListener(() => {
  // Menu parent
  chrome.contextMenus.create({
    id: "lucidSelectMenu",
    title: "LucidSelect",
    contexts: ["selection"] // Le menu n'apparaît que lors d'une sélection de texte
  });
  
  // Options prédéfinies
  chrome.contextMenus.create({
    id: "answerQuestion",
    parentId: "lucidSelectMenu",
    title: "Répondre à la question sélectionnée",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "paraphrase",
    parentId: "lucidSelectMenu",
    title: "Paraphraser",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "summarize",
    parentId: "lucidSelectMenu",
    title: "Résumer",
    contexts: ["selection"]
  });
  
  // Option QCM/Quiz
  chrome.contextMenus.create({
    id: "analyzeQCM",
    parentId: "lucidSelectMenu",
    title: "Analyser QCM/Quiz",
    contexts: ["selection"]
  });
  
  // Option personnalisée
  chrome.contextMenus.create({
    id: "askChatGPT",
    parentId: "lucidSelectMenu",
    title: "Question à propos de la sélection",
    contexts: ["selection"]
  });
});

// Gestion du clic sur l'élément du menu contextuel
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Vérifier si une sélection de texte existe
  if (info.selectionText) {
    if (info.menuItemId === "askChatGPT") {
      // Envoyer un message au script de contenu avec le texte sélectionné pour afficher la popup
      chrome.tabs.sendMessage(tab.id, {
        action: "showPromptPopup",
        selection: info.selectionText
      });
    } else if (info.menuItemId === "answerQuestion") {
      // Envoyer directement la question à l'API
      chrome.tabs.sendMessage(tab.id, {
        action: "directQuery",
        selection: info.selectionText,
        prompt: "Réponds à cette question"
      });
    } else if (info.menuItemId === "paraphrase") {
      // Paraphraser le texte sélectionné
      chrome.tabs.sendMessage(tab.id, {
        action: "directQuery",
        selection: info.selectionText,
        prompt: "Paraphrase ce texte"
      });
    } else if (info.menuItemId === "summarize") {
      // Résumer le texte sélectionné
      chrome.tabs.sendMessage(tab.id, {
        action: "directQuery",
        selection: info.selectionText,
        prompt: "Résume ce texte"
      });
    } else if (info.menuItemId === "analyzeQCM") {
      // Analyser le QCM/Quiz
      chrome.tabs.sendMessage(tab.id, {
        action: "directQuery",
        selection: info.selectionText,
        prompt: "Ceci est un QCM ou un quiz. Identifie la ou les bonnes réponses parmi les options proposées. Explique brièvement ton raisonnement. Si tu n'es pas sûr, indique-le clairement."
      });
    }
  }
});

// Gestion des raccourcis clavier
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "ask_question") {
    // Demander la sélection actuelle et afficher la popup
    chrome.tabs.sendMessage(tab.id, {
      action: "getSelectionAndShowPopup"
    });
  } else if (command === "answer_selected_question") {
    // Répondre directement à la question sélectionnée
    chrome.tabs.sendMessage(tab.id, {
      action: "directQuery",
      prompt: "Réponds à cette question"
    });
  }
});

// Écouter les messages du script de contenu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Si le message demande la clé API
  if (request.action === "getApiKey") {
    chrome.storage.local.get(["openai_api_key"], (result) => {
      sendResponse({ apiKey: result.openai_api_key || "" });
    });
    return true; // Indique que la réponse sera envoyée de manière asynchrone
  }
  
  // Si le message demande d'envoyer une requête à l'API AI
  if (request.action === "queryChatGPT") {
    chrome.storage.local.get(["openai_api_key", "together_api_key", "selected_api"], (result) => {
      let apiKey, apiUrl, apiHeaders;
      
      // Déterminer quelle API utiliser
      const selectedApi = result.selected_api || "openai";
      
      if (selectedApi === "openai") {
        apiKey = result.openai_api_key;
        apiUrl = "https://api.openai.com/v1/chat/completions";
        apiHeaders = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };
      } else if (selectedApi === "together") {
        apiKey = result.together_api_key;
        apiUrl = "https://api.together.xyz/inference";
        apiHeaders = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        };
      }
      
      if (!apiKey) {
        sendResponse({
          success: false,
          error: `Clé API ${selectedApi} non configurée. Veuillez la configurer dans les options de l'extension.`
        });
        return;
      }
      
      // Fonction pour appeler l'API OpenAI avec backoff exponentiel
      const callOpenAIWithBackoff = async (attempt = 1, maxAttempts = 3, delay = 1000) => {
        try {
          // Appel à l'API AI
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: apiHeaders,
            body: JSON.stringify({
              model: selectedApi === "openai" ? "gpt-3.5-turbo" : "mistralai/Mistral-Small-24B-Instruct-2501",
              messages: [
                {
                  role: "system",
                  content: "Tu es un assistant utile et concis."
                },
                {
                  role: "user",
                  content: `Texte sélectionné: "${request.selection}". Question: ${request.question}`
                }
              ],
              max_tokens: 500
            })
          });
          
          if (!response.ok) {
            // Si c'est une erreur 429 et qu'on n'a pas dépassé le nombre max de tentatives
            if (response.status === 429 && attempt < maxAttempts) {
              console.log(`Erreur 429 reçue, tentative ${attempt}/${maxAttempts}. Nouvelle tentative dans ${delay}ms...`);
              // Attendre avec un délai exponentiel
              await new Promise(resolve => setTimeout(resolve, delay));
              // Réessayer avec un délai doublé
              return callOpenAIWithBackoff(attempt + 1, maxAttempts, delay * 2);
            }
            
            // Gestion plus détaillée des erreurs 429
            if (response.status === 429) {
              const apiPlatform = selectedApi === "openai" ? "OpenAI" : "Together.ai";
              const apiSite = selectedApi === "openai" ? "platform.openai.com" : "api.together.xyz";
              throw new Error(`Erreur API ${apiPlatform}: 429 - Trop de requêtes. Cela peut être dû à un dépassement de limite de requêtes, un solde insuffisant sur votre compte, ou un problème avec votre clé API. Veuillez vérifier votre compte sur ${apiSite}.`);
            } else {
              throw new Error(`Erreur API: ${response.status}`);
            }
          }
          
          return response.json();
        } catch (error) {
          throw error;
        }
      };
      
      // Appel de la fonction avec backoff
      callOpenAIWithBackoff()
      .then(data => {
        sendResponse({
          success: true,
          answer: data.choices[0].message.content
        });
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    });
    
    return true; // Indique que la réponse sera envoyée de manière asynchrone
  }
});