// popup.js - Script pour la popup de LucidSelect

// Éléments du DOM
const apiStatusElement = document.getElementById('api-status');
const optionsLink = document.getElementById('options-link');

// Vérifier si la clé API est configurée
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['openai_api_key', 'together_api_key', 'claude_api_key', 'gemini_api_key', 'selected_api'], (result) => {
    // Déterminer quelle API est sélectionnée
    const selectedApi = result.selected_api || 'openai';
    
    // Vérifier si la clé API correspondante est configurée
    let apiKey = null;
    switch (selectedApi) {
      case 'openai':
        apiKey = result.openai_api_key;
        break;
      case 'together':
        apiKey = result.together_api_key;
        break;
      case 'claude':
        apiKey = result.claude_api_key;
        break;
      case 'gemini':
        apiKey = result.gemini_api_key;
        break;
    }
    
    if (apiKey) {
      // La clé API est configurée
      apiStatusElement.innerHTML = 'Clé API configurée <span style="color: #0f9d58;">✓</span>';
      apiStatusElement.className = 'api-status success';
    } else {
      // La clé API n'est pas configurée
      apiStatusElement.innerHTML = 'Clé API non configurée <span style="color: #d93025;">⚠️</span> Veuillez configurer votre clé API pour utiliser l\'extension.';
      apiStatusElement.className = 'api-status error';
    }
  });
});

// Ouvrir la page d'options lorsque le lien est cliqué
optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});