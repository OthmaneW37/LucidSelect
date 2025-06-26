// options.js - Script pour la page d'options de LucidSelect

// Éléments du DOM
const apiKeyInput = document.getElementById('api-key');
const togetherKeyInput = document.getElementById('together-key');
const openaiRadio = document.getElementById('openai-api');
const togetherRadio = document.getElementById('together-api');
const openaiGroup = document.getElementById('openai-group');
const togetherGroup = document.getElementById('together-group');
const saveButton = document.getElementById('save-btn');
const clearButton = document.getElementById('clear-btn');
const statusElement = document.getElementById('status');

// Masquer les deux groupes API au départ
openaiGroup.style.display = 'none';
togetherGroup.style.display = 'none';

// Charger les paramètres existants au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Récupérer les clés API et l'API sélectionnée depuis le stockage local
  chrome.storage.local.get([
    'openai_api_key', 
    'together_api_key', 
    'selected_api'
  ], (result) => {
    if (result.openai_api_key) {
      apiKeyInput.value = result.openai_api_key;
    }
    
    if (result.together_api_key) {
      togetherKeyInput.value = result.together_api_key;
    }
    
    // Définir l'API sélectionnée
    if (result.selected_api === 'together') {
      togetherRadio.checked = true;
      openaiGroup.style.display = 'none';
      togetherGroup.style.display = 'block';
    } else {
      openaiRadio.checked = true;
      openaiGroup.style.display = 'block';
      togetherGroup.style.display = 'none';
    }
  });
});

// Gérer le changement d'API
openaiRadio.addEventListener('change', () => {
  if (openaiRadio.checked) {
    openaiGroup.style.display = 'block';
    togetherGroup.style.display = 'none';
  }
});

togetherRadio.addEventListener('change', () => {
  if (togetherRadio.checked) {
    openaiGroup.style.display = 'none';
    togetherGroup.style.display = 'block';
  }
});

// Fonction pour afficher un message de statut
function showStatus(message, isSuccess = true) {
  statusElement.textContent = message;
  statusElement.className = `status ${isSuccess ? 'success' : 'error'}`;
  statusElement.style.display = 'block';
  
  // Masquer le message après 3 secondes
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Enregistrer les paramètres
saveButton.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  const togetherKey = togetherKeyInput.value.trim();
  const selectedApi = openaiRadio.checked ? 'openai' : 'together';
  
  // Vérifier quelle API est sélectionnée et si la clé correspondante est valide
  if (selectedApi === 'openai') {
    if (!apiKey || !apiKey.startsWith('sk-')) {
      showStatus('Clé API OpenAI invalide. La clé doit commencer par "sk-".', false);
      return;
    }
  } else if (selectedApi === 'together') {
    if (!togetherKey) {
      showStatus('Clé API Together.ai invalide.', false);
      return;
    }
  }
  
  // Enregistrer les paramètres dans le stockage local
  chrome.storage.local.set({
    openai_api_key: apiKey,
    together_api_key: togetherKey,
    selected_api: selectedApi
  }, () => {
    if (selectedApi === 'openai') {
      showStatus('Paramètres enregistrés avec succès! <br><br>⚠️ Attention: Si vous rencontrez des erreurs 429, cela peut être dû à des limites de taux ou à un solde insuffisant sur votre compte OpenAI. <br><br>Vérifiez votre <a href="https://platform.openai.com/account/usage" target="_blank">utilisation</a> et vos <a href="https://platform.openai.com/account/billing/overview" target="_blank">informations de facturation</a>.', true);
    } else {
      showStatus('Paramètres enregistrés avec succès! <br><br>⚠️ Attention: Si vous rencontrez des erreurs 429, cela peut être dû à des limites de taux sur votre compte Together.ai. <br><br>Vérifiez votre <a href="https://api.together.xyz/settings/api-keys" target="_blank">utilisation</a>.', true);
    }
  });
});

// Effacer les clés API
clearButton.addEventListener('click', () => {
  const selectedApi = openaiRadio.checked ? 'openai' : 'together';
  
  if (selectedApi === 'openai') {
    // Effacer la clé API OpenAI du stockage local
    chrome.storage.local.remove('openai_api_key', () => {
      // Effacer le champ de saisie
      apiKeyInput.value = '';
      showStatus('Clé API OpenAI effacée.', true);
    });
  } else {
    // Effacer la clé API Together.ai du stockage local
    chrome.storage.local.remove('together_api_key', () => {
      // Effacer le champ de saisie
      togetherKeyInput.value = '';
      showStatus('Clé API Together.ai effacée.', true);
    });
  }
});