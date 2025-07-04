// ai-models-ui.js - Interface utilisateur pour gérer les modèles d'IA

import { getApiKey, setApiKey, getSelectedModel, setSelectedModel, getAvailableModels } from '../utils/ai-models.js';
import { AI_MODELS } from '../utils/constants.js';
import multilingualUI from './multilingual-ui.js';

/**
 * Classe pour gérer l'interface utilisateur des modèles d'IA
 */
class AIModelsUI {
  /**
   * Initialise l'interface des modèles d'IA
   */
  constructor() {
    this.container = null;
    this.modelsContainer = null;
    this.selectedModel = null;
    this.availableModels = [];
  }

  /**
   * Initialise l'interface utilisateur des modèles d'IA
   * @param {HTMLElement} container - Conteneur pour l'interface
   * @returns {Promise<void>}
   */
  async init(container) {
    this.container = container || document.getElementById('ai-models-container');
    
    if (!this.container) {
      console.error('Conteneur pour les modèles d\'IA non trouvé');
      return;
    }
    
    // Charger les modèles disponibles
    this.availableModels = await getAvailableModels();
    
    // Charger le modèle sélectionné
    this.selectedModel = await getSelectedModel();
    
    // Créer l'interface
    this.createUI();
    
    // Ajouter les écouteurs d'événements
    this.setupEventListeners();
    
    // Écouter les changements de langue
    document.addEventListener('languageChanged', () => this.updateUITranslations());
  }

  /**
   * Crée l'interface utilisateur
   */
  createUI() {
    // Vider le conteneur
    this.container.innerHTML = '';
    
    // Créer le titre
    const title = multilingualUI.createTranslatedElement('h2', 'ai_models.title', { class: 'section-title' });
    this.container.appendChild(title);
    
    // Créer la description
    const description = multilingualUI.createTranslatedElement('p', 'ai_models.description', { class: 'section-description' });
    this.container.appendChild(description);
    
    // Créer le conteneur des modèles
    this.modelsContainer = document.createElement('div');
    this.modelsContainer.className = 'models-container';
    this.container.appendChild(this.modelsContainer);
    
    // Afficher les modèles
    this.renderModels();
  }

  /**
   * Affiche les modèles d'IA disponibles
   */
  renderModels() {
    // Vider le conteneur des modèles
    this.modelsContainer.innerHTML = '';
    
    // Créer un élément pour chaque modèle
    Object.entries(AI_MODELS).forEach(([modelId, modelInfo]) => {
      const modelElement = document.createElement('div');
      modelElement.className = 'model-item';
      modelElement.dataset.id = modelId;
      
      if (modelId === this.selectedModel) {
        modelElement.classList.add('selected');
      }
      
      const modelHeader = document.createElement('div');
      modelHeader.className = 'model-header';
      
      const modelTitle = document.createElement('h3');
      modelTitle.className = 'model-title';
      modelTitle.textContent = modelInfo.name;
      
      const modelLogo = document.createElement('img');
      modelLogo.className = 'model-logo';
      modelLogo.src = modelInfo.logo || 'images/ai-default.svg';
      modelLogo.alt = `${modelInfo.name} logo`;
      
      modelHeader.appendChild(modelLogo);
      modelHeader.appendChild(modelTitle);
      
      const modelDescription = document.createElement('p');
      modelDescription.className = 'model-description';
      modelDescription.textContent = multilingualUI.translate(`ai_models.${modelId}.description`);
      
      const modelFeatures = document.createElement('ul');
      modelFeatures.className = 'model-features';
      
      // Ajouter les caractéristiques du modèle
      modelInfo.features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.textContent = multilingualUI.translate(`ai_models.${modelId}.features.${feature}`);
        modelFeatures.appendChild(featureItem);
      });
      
      // Créer le formulaire d'API key
      const apiKeyForm = document.createElement('div');
      apiKeyForm.className = 'api-key-form';
      
      const apiKeyLabel = multilingualUI.createTranslatedElement('label', `ai_models.${modelId}.api_key_label`, { for: `${modelId}-api-key` });
      
      const apiKeyInput = document.createElement('input');
      apiKeyInput.type = 'password';
      apiKeyInput.id = `${modelId}-api-key`;
      apiKeyInput.className = 'api-key-input';
      apiKeyInput.setAttribute('data-i18n-placeholder', 'ai_models.api_key_placeholder');
      apiKeyInput.placeholder = multilingualUI.translate('ai_models.api_key_placeholder');
      
      const toggleVisibilityButton = document.createElement('button');
      toggleVisibilityButton.className = 'toggle-visibility-button';
      toggleVisibilityButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
      toggleVisibilityButton.setAttribute('data-i18n-title', 'ai_models.toggle_visibility');
      toggleVisibilityButton.title = multilingualUI.translate('ai_models.toggle_visibility');
      
      const saveApiKeyButton = document.createElement('button');
      saveApiKeyButton.className = 'save-api-key-button';
      saveApiKeyButton.setAttribute('data-i18n', 'ai_models.save_api_key');
      saveApiKeyButton.textContent = multilingualUI.translate('ai_models.save_api_key');
      
      apiKeyForm.appendChild(apiKeyLabel);
      
      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';
      inputContainer.appendChild(apiKeyInput);
      inputContainer.appendChild(toggleVisibilityButton);
      
      apiKeyForm.appendChild(inputContainer);
      apiKeyForm.appendChild(saveApiKeyButton);
      
      // Créer le bouton de sélection
      const selectButton = document.createElement('button');
      selectButton.className = 'select-model-button';
      selectButton.setAttribute('data-i18n', modelId === this.selectedModel ? 'ai_models.selected' : 'ai_models.select');
      selectButton.textContent = multilingualUI.translate(modelId === this.selectedModel ? 'ai_models.selected' : 'ai_models.select');
      
      if (modelId === this.selectedModel) {
        selectButton.disabled = true;
      }
      
      // Ajouter les éléments au modèle
      modelElement.appendChild(modelHeader);
      modelElement.appendChild(modelDescription);
      modelElement.appendChild(modelFeatures);
      modelElement.appendChild(apiKeyForm);
      modelElement.appendChild(selectButton);
      
      // Ajouter les écouteurs d'événements
      toggleVisibilityButton.addEventListener('click', () => this.toggleApiKeyVisibility(apiKeyInput, toggleVisibilityButton));
      saveApiKeyButton.addEventListener('click', () => this.saveApiKey(modelId, apiKeyInput.value));
      selectButton.addEventListener('click', () => this.selectModel(modelId));
      
      // Charger la clé API existante
      this.loadApiKey(modelId, apiKeyInput);
      
      this.modelsContainer.appendChild(modelElement);
    });
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Les écouteurs d'événements sont ajoutés lors du rendu des modèles
  }

  /**
   * Charge la clé API pour un modèle
   * @param {string} modelId - ID du modèle
   * @param {HTMLInputElement} inputElement - Élément d'entrée pour la clé API
   * @returns {Promise<void>}
   */
  async loadApiKey(modelId, inputElement) {
    try {
      const apiKey = await getApiKey(modelId);
      
      if (apiKey) {
        // Masquer la clé API pour des raisons de sécurité
        inputElement.value = '••••••••••••••••••••••••••';
        inputElement.dataset.hasKey = 'true';
      } else {
        inputElement.value = '';
        inputElement.dataset.hasKey = 'false';
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de la clé API pour ${modelId}:`, error);
    }
  }

  /**
   * Bascule la visibilité de la clé API
   * @param {HTMLInputElement} inputElement - Élément d'entrée pour la clé API
   * @param {HTMLButtonElement} buttonElement - Bouton de basculement
   */
  toggleApiKeyVisibility(inputElement, buttonElement) {
    if (inputElement.type === 'password') {
      inputElement.type = 'text';
      buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
      buttonElement.title = multilingualUI.translate('ai_models.hide_api_key');
    } else {
      inputElement.type = 'password';
      buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
      buttonElement.title = multilingualUI.translate('ai_models.show_api_key');
    }
  }

  /**
   * Sauvegarde la clé API pour un modèle
   * @param {string} modelId - ID du modèle
   * @param {string} apiKey - Clé API
   * @returns {Promise<void>}
   */
  async saveApiKey(modelId, apiKey) {
    // Ne pas sauvegarder si la clé est masquée
    if (apiKey === '••••••••••••••••••••••••••') {
      return;
    }
    
    try {
      await setApiKey(modelId, apiKey);
      
      // Mettre à jour l'interface
      const inputElement = document.getElementById(`${modelId}-api-key`);
      if (inputElement) {
        inputElement.value = apiKey ? '••••••••••••••••••••••••••' : '';
        inputElement.dataset.hasKey = apiKey ? 'true' : 'false';
      }
      
      // Afficher un message de confirmation
      this.showNotification(multilingualUI.translate('ai_models.api_key_saved'));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la clé API pour ${modelId}:`, error);
      this.showNotification(multilingualUI.translate('ai_models.api_key_error'), 'error');
    }
  }

  /**
   * Sélectionne un modèle d'IA
   * @param {string} modelId - ID du modèle
   * @returns {Promise<void>}
   */
  async selectModel(modelId) {
    try {
      // Vérifier si une clé API est définie
      const apiKey = await getApiKey(modelId);
      
      if (!apiKey) {
        this.showNotification(multilingualUI.translate('ai_models.api_key_required'), 'error');
        return;
      }
      
      // Sauvegarder le modèle sélectionné
      await setSelectedModel(modelId);
      this.selectedModel = modelId;
      
      // Mettre à jour l'interface
      this.renderModels();
      
      // Afficher un message de confirmation
      this.showNotification(multilingualUI.translate('ai_models.model_selected', { model: AI_MODELS[modelId].name }));
      
      // Déclencher un événement personnalisé pour informer les autres composants
      const event = new CustomEvent('modelChanged', { detail: { model: modelId } });
      document.dispatchEvent(event);
    } catch (error) {
      console.error(`Erreur lors de la sélection du modèle ${modelId}:`, error);
      this.showNotification(multilingualUI.translate('ai_models.model_selection_error'), 'error');
    }
  }

  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (info, success, error)
   */
  showNotification(message, type = 'success') {
    // Créer un événement personnalisé pour afficher une notification
    const event = new CustomEvent('showNotification', { 
      detail: { message, type }
    });
    document.dispatchEvent(event);
  }

  /**
   * Met à jour les traductions de l'interface
   */
  updateUITranslations() {
    // Mettre à jour les éléments avec des attributs data-i18n
    multilingualUI.updateUI();
    
    // Recharger les modèles pour mettre à jour les traductions
    this.renderModels();
  }
}

// Exporter une instance singleton
const aiModelsUI = new AIModelsUI();
export default aiModelsUI;