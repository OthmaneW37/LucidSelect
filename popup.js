// popup.js - Script pour la popup de LucidSelect

// Éléments du DOM
const apiStatusElement = document.getElementById('api-status');
const optionsLink = document.getElementById('options-link');

// Vérifier si la clé API est configurée
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['openai_api_key'], (result) => {
    if (result.openai_api_key) {
      // La clé API est configurée
      apiStatusElement.textContent = 'Clé API configurée ✓';
      apiStatusElement.className = 'api-status success';
    } else {
      // La clé API n'est pas configurée
      apiStatusElement.textContent = 'Clé API non configurée ⚠️ Veuillez configurer votre clé API pour utiliser l\'extension.';
      apiStatusElement.className = 'api-status error';
    }
  });
});

// Ouvrir la page d'options lorsque le lien est cliqué
optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});