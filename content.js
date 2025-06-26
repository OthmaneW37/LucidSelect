// content.js - Script de contenu pour LucidSelect

// Variables globales
let selectedText = "";
let selectionRange = null;
let tooltipTimeout = null;

// Détecter si nous sommes sur une page où l'extension doit être active
const isRestrictedPage = window.location.hostname === "chat.openai.com" || 
                        window.location.protocol === "chrome:" || 
                        window.location.protocol === "chrome-extension:";

if (isRestrictedPage) {
  document.body.classList.add("chat-openai");
} else {
  // Écouter les messages du script de fond
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showPromptPopup") {
      selectedText = request.selection;
      showPromptPopup();
    } else if (request.action === "directQuery") {
      // Pour les requêtes directes (paraphrase, résumé, réponse à une question)
      selectedText = request.selection;
      sendDirectQueryToChatGPT(request.prompt);
    } else if (request.action === "getSelectionAndShowPopup") {
      // Pour le raccourci clavier - récupérer la sélection actuelle
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== "") {
        selectedText = selection.toString();
        showPromptPopup();
      }
    } else if (request.action === "getSelection") {
      sendResponse({ text: window.getSelection().toString() });
    }
    return true;
  });

  // Ajouter un écouteur d'événements pour le clic droit
  document.addEventListener('contextmenu', (event) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      chrome.runtime.sendMessage({ action: 'textSelected', text: selection });
    }
  });
}


  // Fonction pour afficher la popup de saisie de question
  function showPromptPopup() {
    // Sauvegarder la sélection actuelle
    saveCurrentSelection();
    
    // Créer la popup si elle n'existe pas déjà
    removeExistingElements();
    
    const popup = document.createElement("div");
    popup.className = "lucidselect-prompt-popup";
    
    // Obtenir la position de la sélection pour placer la popup
    const selectionRect = getSelectionCoordinates();
    
    // Positionner la popup près de la sélection
    popup.style.left = `${selectionRect.left}px`;
    popup.style.top = `${selectionRect.bottom + 10}px`;
    
    // Contenu de la popup
    popup.innerHTML = `
      <div class="lucidselect-header">
        <span>Question à propos de la sélection</span>
        <button class="lucidselect-close-btn">×</button>
      </div>
      <div class="lucidselect-content">
        <textarea class="lucidselect-question" placeholder="Posez votre question à propos du texte sélectionné..."></textarea>
        <button class="lucidselect-submit-btn">Envoyer</button>
      </div>
    `;
    
    // Ajouter la popup au document
    document.body.appendChild(popup);
    
    // Focus sur le champ de texte
    popup.querySelector(".lucidselect-question").focus();
    
    // Gérer la fermeture de la popup
    popup.querySelector(".lucidselect-close-btn").addEventListener("click", () => {
      popup.remove();
    });
    
    // Gérer l'envoi de la question
    popup.querySelector(".lucidselect-submit-btn").addEventListener("click", () => {
      const question = popup.querySelector(".lucidselect-question").value.trim();
      if (question) {
        popup.remove();
        sendQuestionToChatGPT(question);
      }
    });
    
    // Gérer l'envoi avec la touche Entrée (mais permettre les sauts de ligne avec Shift+Entrée)
    popup.querySelector(".lucidselect-question").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const question = popup.querySelector(".lucidselect-question").value.trim();
        if (question) {
          popup.remove();
          sendQuestionToChatGPT(question);
        }
      }
    });
  }

  // Fonction pour envoyer une requête directe à l'API AI
  function sendDirectQueryToChatGPT(prompt) {
    // Sauvegarder la sélection actuelle
    saveCurrentSelection();
    
    // Afficher un indicateur de chargement
    showLoadingTooltip();
    
    // Envoyer un message au script de fond pour obtenir la réponse de l'API
    chrome.runtime.sendMessage({
      action: "queryChatGPT",
      selection: selectedText,
      question: prompt
    }, (response) => {
      if (response.success) {
        showAnswerTooltip(response.answer);
      } else {
        showErrorTooltip(response.error);
      }
    });
  }

  // Fonction pour afficher la popup de saisie de question
  function showPromptPopup() {
    // Sauvegarder la sélection actuelle
    saveCurrentSelection();
    
    // Créer la popup si elle n'existe pas déjà
    removeExistingElements();
    
    const popup = document.createElement("div");
    popup.className = "lucidselect-prompt-popup";
    
    // Obtenir la position de la sélection pour placer la popup
    const selectionRect = getSelectionCoordinates();
    
    // Positionner la popup près de la sélection
    popup.style.left = `${selectionRect.left}px`;
    popup.style.top = `${selectionRect.bottom + 10}px`;
    
    // Contenu de la popup
    popup.innerHTML = `
      <div class="lucidselect-header">
        <span>Question à propos de la sélection</span>
        <button class="lucidselect-close-btn">×</button>
      </div>
      <div class="lucidselect-content">
        <textarea class="lucidselect-question" placeholder="Posez votre question à propos du texte sélectionné..."></textarea>
        <button class="lucidselect-submit-btn">Envoyer</button>
      </div>
    `;
    
    // Ajouter la popup au document
    document.body.appendChild(popup);
    
    // Focus sur le champ de texte
    popup.querySelector(".lucidselect-question").focus();
    
    // Gérer la fermeture de la popup
    popup.querySelector(".lucidselect-close-btn").addEventListener("click", () => {
      popup.remove();
    });
    
    // Gérer l'envoi de la question
    popup.querySelector(".lucidselect-submit-btn").addEventListener("click", () => {
      const question = popup.querySelector(".lucidselect-question").value.trim();
      if (question) {
        popup.remove();
        sendQuestionToChatGPT(question);
      }
    });
    
    // Gérer l'envoi avec la touche Entrée (mais permettre les sauts de ligne avec Shift+Entrée)
    popup.querySelector(".lucidselect-question").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const question = popup.querySelector(".lucidselect-question").value.trim();
        if (question) {
          popup.remove();
          sendQuestionToChatGPT(question);
        }
      }
    });
  }

  // Fonction pour sauvegarder la sélection actuelle
  function saveCurrentSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selectionRange = selection.getRangeAt(0);
    }
  }

  // Fonction pour obtenir les coordonnées de la sélection
  function getSelectionCoordinates() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rects = range.getClientRects();
      
      if (rects.length > 0) {
        // Utiliser le premier rectangle pour la position
        const rect = rects[0];
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          bottom: rect.bottom + window.scrollY,
          width: rect.width,
          height: rect.height
        };
      }
    }
    
    // Position par défaut si aucune sélection n'est trouvée
    return {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      right: window.innerWidth / 2,
      bottom: window.innerHeight / 2,
      width: 0,
      height: 0
    };
  }

  // Fonction pour envoyer la question à ChatGPT via le script de fond
  function sendQuestionToChatGPT(question) {
    // Afficher un indicateur de chargement
    showLoadingTooltip();
    
    // Envoyer un message au script de fond pour obtenir la réponse de ChatGPT
    chrome.runtime.sendMessage({
      action: "queryChatGPT",
      selection: selectedText,
    question: question
  }, (response) => {
    // Supprimer l'indicateur de chargement
    removeExistingElements();
    
    if (response && response.success) {
      // Afficher la réponse dans une bulle
      showAnswerTooltip(response.answer);
    } else {
      // Afficher l'erreur dans une bulle
      const errorMessage = response && response.error ? response.error : "Erreur lors de la communication avec ChatGPT";
      showErrorTooltip(errorMessage);
    }
  });
}

// Fonction pour afficher un indicateur de chargement
function showLoadingTooltip() {
  removeExistingElements();
  
  // Restaurer la sélection originale
  restoreSelection();
  
  const tooltip = document.createElement("div");
  tooltip.className = "lucidselect-tooltip lucidselect-loading";
  
  // Obtenir la position de la sélection
  const selectionRect = getSelectionCoordinates();
  
  // Positionner la bulle au-dessus de la sélection
  tooltip.style.left = `${selectionRect.left}px`;
  tooltip.style.top = `${selectionRect.top - 40}px`;
  
  tooltip.innerHTML = `
    <div class="lucidselect-tooltip-content">
      <div class="lucidselect-loading-spinner"></div>
      <span>Interrogation de ChatGPT...</span>
    </div>
  `;
  
  document.body.appendChild(tooltip);
}

// Fonction pour afficher la réponse dans une bulle
function showAnswerTooltip(answer) {
  removeExistingElements();
  
  // Restaurer la sélection originale
  restoreSelection();
  
  const tooltip = document.createElement("div");
  tooltip.className = "lucidselect-tooltip lucidselect-answer";
  
  // Obtenir la position de la sélection
  const selectionRect = getSelectionCoordinates();
  
  // Positionner la bulle au-dessus de la sélection
  tooltip.style.left = `${selectionRect.left}px`;
  tooltip.style.top = `${selectionRect.top - 40}px`;
  
  // Formater la réponse (convertir les sauts de ligne en HTML)
  const formattedAnswer = answer.replace(/\n/g, "<br>");
  
  tooltip.innerHTML = `
    <div class="lucidselect-tooltip-header">
      <span>Réponse de ChatGPT</span>
      <button class="lucidselect-close-btn">×</button>
    </div>
    <div class="lucidselect-tooltip-content">
      ${formattedAnswer}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Gérer la fermeture de la bulle
  tooltip.querySelector(".lucidselect-close-btn").addEventListener("click", () => {
    tooltip.remove();
  });
  
  // Fermer automatiquement la bulle après 15 secondes
  tooltipTimeout = setTimeout(() => {
    if (document.body.contains(tooltip)) {
      tooltip.classList.add("lucidselect-fade-out");
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          tooltip.remove();
        }
      }, 500); // Durée de l'animation de fondu
    }
  }, 15000);
}

// Fonction pour afficher une erreur dans une bulle
function showErrorTooltip(errorMessage) {
  removeExistingElements();
  
  // Restaurer la sélection originale
  restoreSelection();
  
  const tooltip = document.createElement("div");
  tooltip.className = "lucidselect-tooltip lucidselect-error";
  
  // Obtenir la position de la sélection
  const selectionRect = getSelectionCoordinates();
  
  // Positionner la bulle au-dessus de la sélection
  tooltip.style.left = `${selectionRect.left}px`;
  tooltip.style.top = `${selectionRect.top - 40}px`;
  
  // Ajouter des informations supplémentaires pour l'erreur 429
  let detailedMessage = errorMessage;
  if (errorMessage.includes("429")) {
    detailedMessage = `${errorMessage}<br><br>
      <strong>Solutions possibles:</strong>
      <ul>
        <li>Attendez quelques minutes avant de réessayer</li>
        <li>Vérifiez votre solde sur <a href="https://platform.openai.com/account/billing/overview" target="_blank">OpenAI</a></li>
        <li>Vérifiez vos <a href="https://platform.openai.com/account/usage" target="_blank">limites d'utilisation</a></li>
      </ul>
    `;
  }
  
  tooltip.innerHTML = `
    <div class="lucidselect-tooltip-header">
      <span>Erreur</span>
      <button class="lucidselect-close-btn">×</button>
    </div>
    <div class="lucidselect-tooltip-content">
      ${detailedMessage}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  // Gérer la fermeture de la bulle
  tooltip.querySelector(".lucidselect-close-btn").addEventListener("click", () => {
    tooltip.remove();
  });
  
  // Fermer automatiquement la bulle après 10 secondes
  tooltipTimeout = setTimeout(() => {
    if (document.body.contains(tooltip)) {
      tooltip.classList.add("lucidselect-fade-out");
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          tooltip.remove();
        }
      }, 500); // Durée de l'animation de fondu
    }
  }, 10000);
}

// Fonction pour restaurer la sélection originale
function restoreSelection() {
  if (selectionRange) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectionRange);
  }
}

// Fonction pour supprimer les popups et tooltips existants
function removeExistingElements() {
  // Supprimer les popups existantes
  const existingPopups = document.querySelectorAll('.lucidselect-prompt-popup');
  existingPopups.forEach(popup => popup.remove());

  // Supprimer les tooltips existants
  const existingTooltips = document.querySelectorAll('.lucidselect-tooltip');
  existingTooltips.forEach(tooltip => tooltip.remove());

  // Annuler le timeout existant
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }
}

// Fonction pour supprimer les éléments existants (popups et tooltips)
function removeExistingElements() {
  // Supprimer les popups existantes
  const existingPopups = document.querySelectorAll(".lucidselect-prompt-popup");
  existingPopups.forEach(popup => popup.remove());
  
  // Supprimer les tooltips existantes
  const existingTooltips = document.querySelectorAll(".lucidselect-tooltip");
  existingTooltips.forEach(tooltip => tooltip.remove());
  
  // Effacer le timeout existant
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }
}

// Fonction pour analyser les QCM et identifier les bonnes réponses
function analyzeQCM(text) {
  if (!qcmModeEnabled) return;
  
  // Afficher un indicateur de chargement
  showLoadingTooltip();
  
  // Envoyer un message au script de fond pour obtenir la réponse de l'API
  chrome.runtime.sendMessage({
    action: "queryChatGPT",
    selection: text,
    question: "Ceci est un QCM ou un quiz. Identifie la ou les bonnes réponses parmi les options proposées. Explique brièvement ton raisonnement. Si tu n'es pas sûr, indique-le clairement."
  }, (response) => {
    if (response.success) {
      showAnswerTooltip(response.answer);
    } else {
      showErrorTooltip(response.error);
    }
  });
}

// Écouteur d'événement pour la sélection de texte (activation automatique)
document.addEventListener('selectionchange', () => {
  if (!autoPopupEnabled) return;
  
  const selection = window.getSelection();
  const selectionText = selection.toString().trim();
  
  // Si une sélection non vide est faite
  if (selectionText.length > 0) {
    // Attendre un court délai pour éviter les activations accidentelles
    setTimeout(() => {
      // Vérifier si la sélection est toujours la même
      if (window.getSelection().toString().trim() === selectionText) {
        selectedText = selectionText;
        showPromptPopup();
      }
    }, 500);
  }
});

// Écouteur d'événement pour le double-clic
document.addEventListener('dblclick', (event) => {
  if (!doubleClickActivateEnabled) return;
  
  const selection = window.getSelection();
  const selectionText = selection.toString().trim();
  
  if (selectionText.length > 0) {
    selectedText = selectionText;
    
    // Si le mode QCM est activé, analyser directement le texte sélectionné
    if (qcmModeEnabled) {
      analyzeQCM(selectedText);
    } else {
      showPromptPopup();
    }
  }
});