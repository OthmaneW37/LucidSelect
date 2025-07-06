// ai-models-ui.js - Interface utilisateur pour gérer les modèles d'IA

import { getApiKey, setApiKey, getSelectedModel, setSelectedModel, getAllModels, getCustomModels, saveCustomModel, deleteCustomModel } from '../utils/ai-models.js';
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
    
    // Charger les modèles disponibles (prédéfinis et personnalisés)
    this.availableModels = await getAllModels();
    
    // Charger le modèle sélectionné
    this.selectedModel = await getSelectedModel();
    
    // Créer l'interface
    this.createUI();
    
    // Ajouter les écouteurs d'événements
    this.setupEventListeners();
    
    // Écouter les changements de langue
    document.addEventListener('languageChanged', () => this.updateUITranslations());
    
    // Écouter les changements de modèles personnalisés
    document.addEventListener('customModelChanged', async () => {
      // Recharger les modèles
      this.availableModels = await getAllModels();
      // Mettre à jour l'interface
      this.renderModels();
    });
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
    
    // Ajouter le bouton pour ajouter un nouveau modèle
    const addModelButton = document.createElement('button');
    addModelButton.className = 'add-model-button';
    addModelButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    addModelButton.setAttribute('data-i18n-title', 'ai_models.add_custom_model');
    addModelButton.title = multilingualUI.translate('ai_models.add_custom_model') || 'Ajouter un modèle personnalisé';
    addModelButton.addEventListener('click', () => this.showAddModelForm());
    
    this.modelsContainer.appendChild(addModelButton);
    
    // Créer un élément pour chaque modèle disponible
    Object.values(this.availableModels).forEach(model => {
      // Ignorer le type CUSTOM qui est juste un marqueur
      if (model.id === AI_MODELS.CUSTOM) return;
      
      const modelElement = document.createElement('div');
      modelElement.className = 'model-item';
      modelElement.dataset.id = model.id;
      
      if (model.type === 'custom') {
        modelElement.classList.add('custom-model');
      }
      
      if (model.id === this.selectedModel) {
        modelElement.classList.add('selected');
      }
      
      const modelHeader = document.createElement('div');
      modelHeader.className = 'model-header';
      
      const modelTitle = document.createElement('h3');
      modelTitle.className = 'model-title';
      modelTitle.textContent = model.name;
      
      const modelLogo = document.createElement('img');
      modelLogo.className = 'model-logo';
      modelLogo.src = model.logo || 'images/ai-default.svg';
      modelLogo.alt = `${model.name} logo`;
      
      modelHeader.appendChild(modelLogo);
      modelHeader.appendChild(modelTitle);
      
      // Ajouter des boutons d'édition et de suppression pour les modèles personnalisés
      if (model.type === 'custom') {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'model-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-model-button';
        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
        editButton.setAttribute('data-i18n-title', 'ai_models.edit_model');
        editButton.title = multilingualUI.translate('ai_models.edit_model') || 'Modifier ce modèle';
        editButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showEditModelForm(model.id);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-model-button';
        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
        deleteButton.setAttribute('data-i18n-title', 'ai_models.delete_model');
        deleteButton.title = multilingualUI.translate('ai_models.delete_model') || 'Supprimer ce modèle';
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.confirmDeleteModel(model.id);
        });
        
        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);
        modelHeader.appendChild(actionsContainer);
      }
      
      const modelDescription = document.createElement('p');
      modelDescription.className = 'model-description';
      
      // Utiliser la description du modèle ou une traduction
      if (model.type === 'custom' && model.description) {
        modelDescription.textContent = model.description;
      } else {
        modelDescription.textContent = multilingualUI.translate(`ai_models.${model.id}.description`) || 
          (model.type === 'predefined' ? `Modèle ${model.name}` : 'Modèle personnalisé');
      }
      
      const modelFeatures = document.createElement('ul');
      modelFeatures.className = 'model-features';
      
      // Ajouter les caractéristiques du modèle
      if (model.type === 'custom' && model.features) {
        // Pour les modèles personnalisés, utiliser les caractéristiques définies
        model.features.forEach(feature => {
          const featureItem = document.createElement('li');
          featureItem.textContent = feature;
          modelFeatures.appendChild(featureItem);
        });
      } else if (model.type === 'predefined') {
        // Pour les modèles prédéfinis, utiliser les traductions
        const features = ['feature1', 'feature2', 'feature3']; // Caractéristiques par défaut
        features.forEach(feature => {
          const featureItem = document.createElement('li');
          featureItem.textContent = multilingualUI.translate(`ai_models.${model.id}.features.${feature}`) || 
            `Caractéristique ${feature}`;
          modelFeatures.appendChild(featureItem);
        });
      }
      
      // Créer le formulaire d'API key
      const apiKeyForm = document.createElement('div');
      apiKeyForm.className = 'api-key-form';
      
      const apiKeyLabel = multilingualUI.createTranslatedElement('label', `ai_models.${model.id}.api_key_label`, { for: `${model.id}-api-key` });
      
      const apiKeyInput = document.createElement('input');
      apiKeyInput.type = 'password';
      apiKeyInput.id = `${model.id}-api-key`;
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
      selectButton.setAttribute('data-i18n', model.id === this.selectedModel ? 'ai_models.selected' : 'ai_models.select');
      selectButton.textContent = multilingualUI.translate(model.id === this.selectedModel ? 'ai_models.selected' : 'ai_models.select');
      
      if (model.id === this.selectedModel) {
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
      saveApiKeyButton.addEventListener('click', () => this.saveApiKey(model.id, apiKeyInput.value));
      selectButton.addEventListener('click', () => this.selectModel(model.id));
      
      // Charger la clé API existante
      this.loadApiKey(model.id, apiKeyInput);
      
      this.modelsContainer.appendChild(modelElement);
    });

    // Ajouter un bouton pour créer un nouveau modèle personnalisé
    const addModelButton = document.createElement('button');
    addModelButton.className = 'add-model-button';
    addModelButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> <span data-i18n="ai_models.add_custom_model">Ajouter un modèle personnalisé</span>';
    addModelButton.addEventListener('click', () => this.showAddModelForm());
    this.modelsContainer.appendChild(addModelButton);
  }

  /**
   * Affiche le formulaire pour ajouter un nouveau modèle personnalisé
   */
  showAddModelForm() {
    // Créer un overlay pour le formulaire
    const overlay = document.createElement('div');
    overlay.className = 'model-form-overlay';
    
    // Créer le formulaire
    const form = document.createElement('form');
    form.className = 'model-form';
    form.innerHTML = `
      <h2 data-i18n="ai_models.add_custom_model">Ajouter un modèle personnalisé</h2>
      <div class="form-group">
        <label for="model-name" data-i18n="ai_models.model_name">Nom du modèle</label>
        <input type="text" id="model-name" required>
      </div>
      <div class="form-group">
        <label for="model-description" data-i18n="ai_models.model_description">Description</label>
        <textarea id="model-description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="model-features" data-i18n="ai_models.model_features">Caractéristiques (une par ligne)</label>
        <textarea id="model-features" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="model-api-endpoint" data-i18n="ai_models.api_endpoint">Point de terminaison API</label>
        <input type="text" id="model-api-endpoint" required>
      </div>
      <div class="form-group">
        <label for="model-api-key-label" data-i18n="ai_models.api_key_label_name">Libellé de la clé API</label>
        <input type="text" id="model-api-key-label" value="Clé API">
      </div>
      <div class="form-group">
        <label for="model-request-template" data-i18n="ai_models.request_template">Modèle de requête (JSON)</label>
        <textarea id="model-request-template" rows="5" placeholder="{\"prompt\": \"{{prompt}}\", \"max_tokens\": 1000}"></textarea>
      </div>
      <div class="form-group">
        <label for="model-response-path" data-i18n="ai_models.response_path">Chemin de la réponse</label>
        <input type="text" id="model-response-path" placeholder="choices[0].text">
      </div>
      <div class="form-group">
        <label for="model-logo-url" data-i18n="ai_models.logo_url">URL du logo (optionnel)</label>
        <input type="text" id="model-logo-url" placeholder="https://example.com/logo.png">
      </div>
      <div class="form-actions">
        <button type="button" class="cancel-button" data-i18n="ai_models.cancel">Annuler</button>
        <button type="submit" class="save-button" data-i18n="ai_models.save">Enregistrer</button>
      </div>
    `;
    
    // Ajouter les écouteurs d'événements
    form.querySelector('.cancel-button').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Récupérer les valeurs du formulaire
      const name = form.querySelector('#model-name').value;
      const description = form.querySelector('#model-description').value;
      const featuresText = form.querySelector('#model-features').value;
      const features = featuresText.split('\n').filter(feature => feature.trim() !== '');
      const apiEndpoint = form.querySelector('#model-api-endpoint').value;
      const apiKeyLabel = form.querySelector('#model-api-key-label').value;
      const requestTemplate = form.querySelector('#model-request-template').value;
      const responsePath = form.querySelector('#model-response-path').value;
      const logoUrl = form.querySelector('#model-logo-url').value;
      
      // Créer l'ID du modèle (basé sur le nom)
      const modelId = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Créer l'objet du modèle
      const customModel = {
        id: modelId,
        name: name,
        type: 'custom',
        description: description,
        features: features,
        apiEndpoint: apiEndpoint,
        apiKeyLabel: apiKeyLabel,
        requestTemplate: requestTemplate,
        responsePath: responsePath,
        logoUrl: logoUrl || null
      };
      
      // Enregistrer le modèle personnalisé
      saveCustomModel(customModel).then(() => {
        // Fermer le formulaire
        document.body.removeChild(overlay);
        
        // Afficher une notification
        const notificationManager = new NotificationManager();
        notificationManager.showNotification(multilingualUI.translate('ai_models.custom_model_added') || 'Modèle personnalisé ajouté avec succès');
        
        // Mettre à jour l'interface utilisateur
        document.dispatchEvent(new CustomEvent('customModelChanged'));
      });
    });
    
    overlay.appendChild(form);
    document.body.appendChild(overlay);
    
    // Traduire les éléments du formulaire
    multilingualUI.translateElements(form.querySelectorAll('[data-i18n]'));
  }

  /**
   * Affiche le formulaire pour éditer un modèle personnalisé existant
   * @param {string} modelId - L'ID du modèle à éditer
   */
  showEditModelForm(modelId) {
    // Récupérer le modèle personnalisé
    getCustomModel(modelId).then(model => {
      if (!model) {
        console.error(`Modèle personnalisé non trouvé: ${modelId}`);
        return;
      }
      
      // Créer un overlay pour le formulaire
      const overlay = document.createElement('div');
      overlay.className = 'model-form-overlay';
      
      // Créer le formulaire
      const form = document.createElement('form');
      form.className = 'model-form';
      form.innerHTML = `
        <h2 data-i18n="ai_models.edit_custom_model">Modifier le modèle personnalisé</h2>
        <div class="form-group">
          <label for="model-name" data-i18n="ai_models.model_name">Nom du modèle</label>
          <input type="text" id="model-name" value="${model.name}" required>
        </div>
        <div class="form-group">
          <label for="model-description" data-i18n="ai_models.model_description">Description</label>
          <textarea id="model-description" rows="3">${model.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="model-features" data-i18n="ai_models.model_features">Caractéristiques (une par ligne)</label>
          <textarea id="model-features" rows="3">${model.features ? model.features.join('\n') : ''}</textarea>
        </div>
        <div class="form-group">
          <label for="model-api-endpoint" data-i18n="ai_models.api_endpoint">Point de terminaison API</label>
          <input type="text" id="model-api-endpoint" value="${model.apiEndpoint}" required>
        </div>
        <div class="form-group">
          <label for="model-api-key-label" data-i18n="ai_models.api_key_label_name">Libellé de la clé API</label>
          <input type="text" id="model-api-key-label" value="${model.apiKeyLabel || 'Clé API'}">
        </div>
        <div class="form-group">
          <label for="model-request-template" data-i18n="ai_models.request_template">Modèle de requête (JSON)</label>
          <textarea id="model-request-template" rows="5">${model.requestTemplate || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="model-response-path" data-i18n="ai_models.response_path">Chemin de la réponse</label>
          <input type="text" id="model-response-path" value="${model.responsePath || ''}">
        </div>
        <div class="form-group">
          <label for="model-logo-url" data-i18n="ai_models.logo_url">URL du logo (optionnel)</label>
          <input type="text" id="model-logo-url" value="${model.logoUrl || ''}">
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-button" data-i18n="ai_models.cancel">Annuler</button>
          <button type="submit" class="save-button" data-i18n="ai_models.save">Enregistrer</button>
        </div>
      `;
      
      // Ajouter les écouteurs d'événements
      form.querySelector('.cancel-button').addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const name = form.querySelector('#model-name').value;
        const description = form.querySelector('#model-description').value;
        const featuresText = form.querySelector('#model-features').value;
        const features = featuresText.split('\n').filter(feature => feature.trim() !== '');
        const apiEndpoint = form.querySelector('#model-api-endpoint').value;
        const apiKeyLabel = form.querySelector('#model-api-key-label').value;
        const requestTemplate = form.querySelector('#model-request-template').value;
        const responsePath = form.querySelector('#model-response-path').value;
        const logoUrl = form.querySelector('#model-logo-url').value;
        
        // Mettre à jour l'objet du modèle
        model.name = name;
        model.description = description;
        model.features = features;
        model.apiEndpoint = apiEndpoint;
        model.apiKeyLabel = apiKeyLabel;
        model.requestTemplate = requestTemplate;
        model.responsePath = responsePath;
        model.logoUrl = logoUrl || null;
        
        // Enregistrer le modèle personnalisé
        saveCustomModel(model).then(() => {
          // Fermer le formulaire
          document.body.removeChild(overlay);
          
          // Afficher une notification
          const notificationManager = new NotificationManager();
          notificationManager.showNotification(multilingualUI.translate('ai_models.custom_model_updated') || 'Modèle personnalisé mis à jour avec succès');
          
          // Mettre à jour l'interface utilisateur
          document.dispatchEvent(new CustomEvent('customModelChanged'));
        });
      });
      
      overlay.appendChild(form);
      document.body.appendChild(overlay);
      
      // Traduire les éléments du formulaire
      multilingualUI.translateElements(form.querySelectorAll('[data-i18n]'));
    });
  }

  /**
   * Affiche une confirmation pour supprimer un modèle personnalisé
   * @param {string} modelId - L'ID du modèle à supprimer
   */
  confirmDeleteModel(modelId) {
    // Récupérer le modèle personnalisé
    getCustomModel(modelId).then(model => {
      if (!model) {
        console.error(`Modèle personnalisé non trouvé: ${modelId}`);
        return;
      }
      
      // Créer un overlay pour la confirmation
      const overlay = document.createElement('div');
      overlay.className = 'model-form-overlay';
      
      // Créer la boîte de dialogue de confirmation
      const confirmBox = document.createElement('div');
      confirmBox.className = 'confirm-box';
      confirmBox.innerHTML = `
        <h2 data-i18n="ai_models.confirm_delete">Confirmer la suppression</h2>
        <p data-i18n="ai_models.confirm_delete_message">Êtes-vous sûr de vouloir supprimer le modèle personnalisé "${model.name}" ?</p>
        <div class="form-actions">
          <button type="button" class="cancel-button" data-i18n="ai_models.cancel">Annuler</button>
          <button type="button" class="delete-button" data-i18n="ai_models.delete">Supprimer</button>
        </div>
      `;
      
      // Ajouter les écouteurs d'événements
      confirmBox.querySelector('.cancel-button').addEventListener('click', () => {
        document.body.removeChild(overlay);
      });
      
      confirmBox.querySelector('.delete-button').addEventListener('click', () => {
        // Supprimer le modèle personnalisé
        deleteCustomModel(modelId).then(() => {
          // Fermer la boîte de dialogue
          document.body.removeChild(overlay);
          
          // Afficher une notification
          const notificationManager = new NotificationManager();
          notificationManager.showNotification(multilingualUI.translate('ai_models.custom_model_deleted') || 'Modèle personnalisé supprimé avec succès');
          
          // Mettre à jour l'interface utilisateur
          document.dispatchEvent(new CustomEvent('customModelChanged'));
        });
      });
      
      overlay.appendChild(confirmBox);
      document.body.appendChild(overlay);
      
      // Traduire les éléments de la boîte de dialogue
      multilingualUI.translateElements(confirmBox.querySelectorAll('[data-i18n]'));
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