// options.js - Script pour la page d'options de LucidSelect

// Éléments du DOM
const apiKeyInput = document.getElementById('api-key');
const togetherKeyInput = document.getElementById('together-key');
const claudeKeyInput = document.getElementById('claude-key');
const geminiKeyInput = document.getElementById('gemini-key');
const openaiRadio = document.getElementById('openai-api');
const togetherRadio = document.getElementById('together-api');
const claudeRadio = document.getElementById('claude-api');
const geminiRadio = document.getElementById('gemini-api');
const openaiGroup = document.getElementById('openai-group');
const togetherGroup = document.getElementById('together-group');
const claudeGroup = document.getElementById('claude-group');
const geminiGroup = document.getElementById('gemini-group');
const saveButton = document.getElementById('save-btn');
const clearButton = document.getElementById('clear-btn');
const statusElement = document.getElementById('status');

// Masquer tous les groupes API au départ
openaiGroup.style.display = 'none';
togetherGroup.style.display = 'none';
claudeGroup.style.display = 'none';
geminiGroup.style.display = 'none';

// Charger les paramètres existants au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Récupérer les clés API et l'API sélectionnée depuis le stockage local
  chrome.storage.local.get([
    'openai_api_key', 
    'together_api_key', 
    'claude_api_key',
    'gemini_api_key',
    'selected_api'
  ], (result) => {
    if (result.openai_api_key) {
      apiKeyInput.value = result.openai_api_key;
    }
    
    if (result.together_api_key) {
      togetherKeyInput.value = result.together_api_key;
    }
    
    if (result.claude_api_key) {
      claudeKeyInput.value = result.claude_api_key;
    }
    
    if (result.gemini_api_key) {
      geminiKeyInput.value = result.gemini_api_key;
    }
    
    // Définir l'API sélectionnée et afficher le groupe correspondant
    // Masquer tous les groupes d'abord
    openaiGroup.style.display = 'none';
    togetherGroup.style.display = 'none';
    claudeGroup.style.display = 'none';
    geminiGroup.style.display = 'none';
    
    // Afficher le groupe correspondant à l'API sélectionnée
    switch (result.selected_api) {
      case 'together':
        togetherRadio.checked = true;
        togetherGroup.style.display = 'block';
        break;
      case 'claude':
        claudeRadio.checked = true;
        claudeGroup.style.display = 'block';
        break;
      case 'gemini':
        geminiRadio.checked = true;
        geminiGroup.style.display = 'block';
        break;
      default: // 'openai' ou non défini
        openaiRadio.checked = true;
        openaiGroup.style.display = 'block';
        break;
    }
  });
});

// Gérer le changement d'API
// Fonction pour masquer tous les groupes
function hideAllGroups() {
  openaiGroup.style.display = 'none';
  togetherGroup.style.display = 'none';
  claudeGroup.style.display = 'none';
  geminiGroup.style.display = 'none';
}

openaiRadio.addEventListener('change', () => {
  if (openaiRadio.checked) {
    hideAllGroups();
    openaiGroup.style.display = 'block';
  }
});

togetherRadio.addEventListener('change', () => {
  if (togetherRadio.checked) {
    hideAllGroups();
    togetherGroup.style.display = 'block';
  }
});

claudeRadio.addEventListener('change', () => {
  if (claudeRadio.checked) {
    hideAllGroups();
    claudeGroup.style.display = 'block';
  }
});

geminiRadio.addEventListener('change', () => {
  if (geminiRadio.checked) {
    hideAllGroups();
    geminiGroup.style.display = 'block';
  }
});

// Fonction pour afficher un message de statut
function showStatus(message, isSuccess = true) {
  statusElement.innerHTML = message;
  statusElement.className = `status ${isSuccess ? 'success' : 'error'}`;
  statusElement.style.display = 'block';
  
  // Masquer le message après 5 secondes pour laisser plus de temps pour lire
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 5000);
}

// Enregistrer les paramètres
saveButton.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  const togetherKey = togetherKeyInput.value.trim();
  const claudeKey = claudeKeyInput.value.trim();
  const geminiKey = geminiKeyInput.value.trim();
  
  // Déterminer quelle API est sélectionnée
  let selectedApi = 'openai'; // Par défaut
  if (togetherRadio.checked) selectedApi = 'together';
  if (claudeRadio.checked) selectedApi = 'claude';
  if (geminiRadio.checked) selectedApi = 'gemini';
  
  // Vérifier si la clé correspondante est valide
  let isValid = true;
  let errorMessage = '';
  
  switch (selectedApi) {
    case 'openai':
      if (!apiKey || !apiKey.startsWith('sk-')) {
        isValid = false;
        errorMessage = 'Clé API OpenAI invalide. La clé doit commencer par "sk-".';
      }
      break;
    case 'together':
      if (!togetherKey) {
        isValid = false;
        errorMessage = 'Clé API Together.ai invalide.';
      }
      break;
    case 'claude':
      if (!claudeKey || !claudeKey.startsWith('sk-ant-')) {
        isValid = false;
        errorMessage = 'Clé API Claude invalide. La clé doit commencer par "sk-ant-".';
      }
      break;
    case 'gemini':
      if (!geminiKey) {
        isValid = false;
        errorMessage = 'Clé API Gemini invalide.';
      }
      break;
  }
  
  if (!isValid) {
    showStatus(errorMessage, false);
    return;
  }
  
  // Enregistrer les paramètres dans le stockage local
  chrome.storage.local.set({
    openai_api_key: apiKey,
    together_api_key: togetherKey,
    claude_api_key: claudeKey,
    gemini_api_key: geminiKey,
    selected_api: selectedApi
  }, () => {
    let successMessage = 'Paramètres enregistrés avec succès!';
    
    // Ajouter des informations spécifiques selon l'API
    switch (selectedApi) {
      case 'openai':
        successMessage += ' <br><br>⚠️ Attention: Si vous rencontrez des erreurs 429, cela peut être dû à des limites de taux ou à un solde insuffisant sur votre compte OpenAI. <br><br>Vérifiez votre <a href="https://platform.openai.com/account/usage" target="_blank">utilisation</a> et vos <a href="https://platform.openai.com/account/billing/overview" target="_blank">informations de facturation</a>.';
        break;
      case 'together':
        successMessage += ' <br><br>⚠️ Attention: Si vous rencontrez des erreurs 429, cela peut être dû à des limites de taux sur votre compte Together.ai. <br><br>Vérifiez votre <a href="https://api.together.xyz/settings/api-keys" target="_blank">utilisation</a>.';
        break;
      case 'claude':
        successMessage += ' <br><br>⚠️ Attention: Si vous rencontrez des erreurs, vérifiez votre <a href="https://console.anthropic.com/account/keys" target="_blank">compte Anthropic</a>.';
        break;
      case 'gemini':
        successMessage += ' <br><br>⚠️ Attention: Si vous rencontrez des erreurs, vérifiez votre <a href="https://aistudio.google.com/app/apikey" target="_blank">compte Google AI Studio</a>.';
        break;
    }
    
    showStatus(successMessage, true);
  });
});

// Effacer les clés API
clearButton.addEventListener('click', () => {
  // Déterminer quelle API est sélectionnée
  let selectedApi = 'openai'; // Par défaut
  if (togetherRadio.checked) selectedApi = 'together';
  if (claudeRadio.checked) selectedApi = 'claude';
  if (geminiRadio.checked) selectedApi = 'gemini';
  
  let storageKey = '';
  let inputElement = null;
  let apiName = '';
  
  // Déterminer la clé de stockage, l'élément d'entrée et le nom de l'API en fonction de l'API sélectionnée
  switch (selectedApi) {
    case 'openai':
      storageKey = 'openai_api_key';
      inputElement = apiKeyInput;
      apiName = 'OpenAI';
      break;
    case 'together':
      storageKey = 'together_api_key';
      inputElement = togetherKeyInput;
      apiName = 'Together.ai';
      break;
    case 'claude':
      storageKey = 'claude_api_key';
      inputElement = claudeKeyInput;
      apiName = 'Claude (Anthropic)';
      break;
    case 'gemini':
      storageKey = 'gemini_api_key';
      inputElement = geminiKeyInput;
      apiName = 'Gemini (Google)';
      break;
  }
  
  // Effacer la clé API du stockage local
  chrome.storage.local.remove(storageKey, () => {
    // Effacer le champ de saisie
    inputElement.value = '';
    showStatus(`Clé API ${apiName} effacée.`, true);
  });
});