// custom-prompts-ui.js - Interface utilisateur pour gérer les modèles de prompts personnalisés

import { getCustomPrompts, addCustomPrompt, updateCustomPrompt, deleteCustomPrompt, getAllPrompts } from '../utils/custom-prompts.js';
import multilingualUI from './multilingual-ui.js';
import PerformanceManager from '../utils/performance.js';

/**
 * Classe pour gérer l'interface utilisateur des prompts personnalisés
 */
class CustomPromptsUI {
  /**
   * Initialise l'interface des prompts personnalisés
   */
  constructor() {
    this.prompts = [];
    this.container = null;
    this.promptsList = null;
    this.promptForm = null;
    this.editingPromptId = null;
    
    // Utiliser le debounce pour la recherche
    this.debouncedSearch = PerformanceManager.debounce(this.searchPrompts.bind(this), 300);
  }

  /**
   * Initialise l'interface utilisateur des prompts personnalisés
   * @param {HTMLElement} container - Conteneur pour l'interface
   * @returns {Promise<void>}
   */
  async init(container) {
    this.container = container || document.getElementById('custom-prompts-container');
    
    if (!this.container) {
      console.error('Conteneur pour les prompts personnalisés non trouvé');
      return;
    }
    
    // Charger les prompts
    await this.loadPrompts();
    
    // Créer l'interface
    this.createUI();
    
    // Ajouter les écouteurs d'événements
    this.setupEventListeners();
    
    // Écouter les changements de langue
    document.addEventListener('languageChanged', () => this.updateUITranslations());
  }

  /**
   * Charge les prompts depuis le stockage
   * @returns {Promise<void>}
   */
  async loadPrompts() {
    try {
      this.prompts = await getAllPrompts();
    } catch (error) {
      console.error('Erreur lors du chargement des prompts:', error);
      this.prompts = [];
    }
  }

  /**
   * Crée l'interface utilisateur
   */
  createUI() {
    // Vider le conteneur
    this.container.innerHTML = '';
    
    // Créer le titre
    const title = multilingualUI.createTranslatedElement('h2', 'custom_prompts.title', { class: 'section-title' });
    this.container.appendChild(title);
    
    // Créer la barre de recherche
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'prompt-search';
    searchInput.className = 'search-input';
    searchInput.setAttribute('data-i18n-placeholder', 'custom_prompts.search_placeholder');
    searchInput.placeholder = multilingualUI.translate('custom_prompts.search_placeholder');
    
    searchContainer.appendChild(searchInput);
    this.container.appendChild(searchContainer);
    
    // Créer la liste des prompts
    this.promptsList = document.createElement('div');
    this.promptsList.className = 'prompts-list';
    this.container.appendChild(this.promptsList);
    
    // Créer le bouton d'ajout
    const addButton = document.createElement('button');
    addButton.id = 'add-prompt-button';
    addButton.className = 'primary-button';
    addButton.setAttribute('data-i18n', 'custom_prompts.add_button');
    addButton.textContent = multilingualUI.translate('custom_prompts.add_button');
    this.container.appendChild(addButton);
    
    // Créer le formulaire
    this.createPromptForm();
    
    // Afficher les prompts
    this.renderPromptsList();
  }

  /**
   * Crée le formulaire d'ajout/modification de prompt
   */
  createPromptForm() {
    this.promptForm = document.createElement('div');
    this.promptForm.className = 'prompt-form hidden';
    
    const formTitle = multilingualUI.createTranslatedElement('h3', 'custom_prompts.form_title', { id: 'form-title' });
    
    const nameLabel = multilingualUI.createTranslatedElement('label', 'custom_prompts.name_label', { for: 'prompt-name' });
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'prompt-name';
    nameInput.className = 'form-input';
    nameInput.setAttribute('data-i18n-placeholder', 'custom_prompts.name_placeholder');
    nameInput.placeholder = multilingualUI.translate('custom_prompts.name_placeholder');
    nameInput.required = true;
    
    const promptLabel = multilingualUI.createTranslatedElement('label', 'custom_prompts.prompt_label', { for: 'prompt-text' });
    const promptTextarea = document.createElement('textarea');
    promptTextarea.id = 'prompt-text';
    promptTextarea.className = 'form-textarea';
    promptTextarea.setAttribute('data-i18n-placeholder', 'custom_prompts.prompt_placeholder');
    promptTextarea.placeholder = multilingualUI.translate('custom_prompts.prompt_placeholder');
    promptTextarea.rows = 5;
    promptTextarea.required = true;
    
    const descriptionLabel = multilingualUI.createTranslatedElement('label', 'custom_prompts.description_label', { for: 'prompt-description' });
    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.id = 'prompt-description';
    descriptionInput.className = 'form-input';
    descriptionInput.setAttribute('data-i18n-placeholder', 'custom_prompts.description_placeholder');
    descriptionInput.placeholder = multilingualUI.translate('custom_prompts.description_placeholder');
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const saveButton = document.createElement('button');
    saveButton.id = 'save-prompt-button';
    saveButton.className = 'primary-button';
    saveButton.setAttribute('data-i18n', 'custom_prompts.save_button');
    saveButton.textContent = multilingualUI.translate('custom_prompts.save_button');
    
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-prompt-button';
    cancelButton.className = 'secondary-button';
    cancelButton.setAttribute('data-i18n', 'custom_prompts.cancel_button');
    cancelButton.textContent = multilingualUI.translate('custom_prompts.cancel_button');
    
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    
    this.promptForm.appendChild(formTitle);
    this.promptForm.appendChild(nameLabel);
    this.promptForm.appendChild(nameInput);
    this.promptForm.appendChild(promptLabel);
    this.promptForm.appendChild(promptTextarea);
    this.promptForm.appendChild(descriptionLabel);
    this.promptForm.appendChild(descriptionInput);
    this.promptForm.appendChild(buttonContainer);
    
    this.container.appendChild(this.promptForm);
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Écouteur pour le bouton d'ajout
    const addButton = document.getElementById('add-prompt-button');
    if (addButton) {
      addButton.addEventListener('click', () => this.showPromptForm());
    }
    
    // Écouteur pour le bouton de sauvegarde
    const saveButton = document.getElementById('save-prompt-button');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.savePrompt());
    }
    
    // Écouteur pour le bouton d'annulation
    const cancelButton = document.getElementById('cancel-prompt-button');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.hidePromptForm());
    }
    
    // Écouteur pour la recherche
    const searchInput = document.getElementById('prompt-search');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        this.debouncedSearch(event.target.value);
      });
    }
  }

  /**
   * Affiche la liste des prompts
   * @param {Array} promptsToShow - Liste des prompts à afficher (optionnel)
   */
  renderPromptsList(promptsToShow = null) {
    const prompts = promptsToShow || this.prompts;
    
    // Vider la liste
    this.promptsList.innerHTML = '';
    
    if (prompts.length === 0) {
      const emptyMessage = multilingualUI.createTranslatedElement('p', 'custom_prompts.empty_list', { class: 'empty-message' });
      this.promptsList.appendChild(emptyMessage);
      return;
    }
    
    // Créer un élément pour chaque prompt
    prompts.forEach(prompt => {
      const promptElement = document.createElement('div');
      promptElement.className = 'prompt-item';
      promptElement.dataset.id = prompt.id;
      
      const promptHeader = document.createElement('div');
      promptHeader.className = 'prompt-header';
      
      const promptName = document.createElement('h3');
      promptName.className = 'prompt-name';
      promptName.textContent = prompt.name;
      
      const promptActions = document.createElement('div');
      promptActions.className = 'prompt-actions';
      
      const editButton = document.createElement('button');
      editButton.className = 'icon-button edit-button';
      editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
      editButton.setAttribute('data-i18n-title', 'custom_prompts.edit_button');
      editButton.title = multilingualUI.translate('custom_prompts.edit_button');
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'icon-button delete-button';
      deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      deleteButton.setAttribute('data-i18n-title', 'custom_prompts.delete_button');
      deleteButton.title = multilingualUI.translate('custom_prompts.delete_button');
      
      promptActions.appendChild(editButton);
      promptActions.appendChild(deleteButton);
      
      promptHeader.appendChild(promptName);
      promptHeader.appendChild(promptActions);
      
      const promptDescription = document.createElement('p');
      promptDescription.className = 'prompt-description';
      promptDescription.textContent = prompt.description || '';
      
      const promptPreview = document.createElement('pre');
      promptPreview.className = 'prompt-preview';
      promptPreview.textContent = prompt.prompt.length > 100 
        ? prompt.prompt.substring(0, 100) + '...'
        : prompt.prompt;
      
      promptElement.appendChild(promptHeader);
      promptElement.appendChild(promptDescription);
      promptElement.appendChild(promptPreview);
      
      // Ajouter les écouteurs d'événements
      editButton.addEventListener('click', () => this.editPrompt(prompt.id));
      deleteButton.addEventListener('click', () => this.confirmDeletePrompt(prompt.id));
      
      this.promptsList.appendChild(promptElement);
    });
  }

  /**
   * Affiche le formulaire d'ajout/modification de prompt
   * @param {Object} prompt - Prompt à modifier (optionnel)
   */
  showPromptForm(prompt = null) {
    const formTitle = document.getElementById('form-title');
    const nameInput = document.getElementById('prompt-name');
    const promptTextarea = document.getElementById('prompt-text');
    const descriptionInput = document.getElementById('prompt-description');
    
    // Réinitialiser le formulaire
    nameInput.value = '';
    promptTextarea.value = '';
    descriptionInput.value = '';
    
    if (prompt) {
      // Mode édition
      this.editingPromptId = prompt.id;
      formTitle.textContent = multilingualUI.translate('custom_prompts.edit_form_title');
      nameInput.value = prompt.name;
      promptTextarea.value = prompt.prompt;
      descriptionInput.value = prompt.description || '';
    } else {
      // Mode ajout
      this.editingPromptId = null;
      formTitle.textContent = multilingualUI.translate('custom_prompts.add_form_title');
    }
    
    // Afficher le formulaire
    this.promptForm.classList.remove('hidden');
    this.promptsList.classList.add('hidden');
    document.getElementById('add-prompt-button').classList.add('hidden');
    document.getElementById('prompt-search').parentElement.classList.add('hidden');
  }

  /**
   * Cache le formulaire d'ajout/modification de prompt
   */
  hidePromptForm() {
    this.promptForm.classList.add('hidden');
    this.promptsList.classList.remove('hidden');
    document.getElementById('add-prompt-button').classList.remove('hidden');
    document.getElementById('prompt-search').parentElement.classList.remove('hidden');
    this.editingPromptId = null;
  }

  /**
   * Sauvegarde un prompt (ajout ou modification)
   * @returns {Promise<void>}
   */
  async savePrompt() {
    const nameInput = document.getElementById('prompt-name');
    const promptTextarea = document.getElementById('prompt-text');
    const descriptionInput = document.getElementById('prompt-description');
    
    // Valider les champs obligatoires
    if (!nameInput.value.trim() || !promptTextarea.value.trim()) {
      alert(multilingualUI.translate('custom_prompts.validation_error'));
      return;
    }
    
    const promptData = {
      name: nameInput.value.trim(),
      prompt: promptTextarea.value.trim(),
      description: descriptionInput.value.trim(),
      isCustom: true
    };
    
    try {
      if (this.editingPromptId) {
        // Mode édition
        promptData.id = this.editingPromptId;
        await updateCustomPrompt(promptData);
      } else {
        // Mode ajout
        await addCustomPrompt(promptData);
      }
      
      // Recharger les prompts
      await this.loadPrompts();
      
      // Mettre à jour l'interface
      this.renderPromptsList();
      this.hidePromptForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du prompt:', error);
      alert(multilingualUI.translate('custom_prompts.save_error'));
    }
  }

  /**
   * Prépare l'édition d'un prompt
   * @param {string} promptId - ID du prompt à éditer
   * @returns {Promise<void>}
   */
  async editPrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    
    if (!prompt) {
      console.error('Prompt non trouvé:', promptId);
      return;
    }
    
    this.showPromptForm(prompt);
  }

  /**
   * Demande confirmation avant de supprimer un prompt
   * @param {string} promptId - ID du prompt à supprimer
   * @returns {Promise<void>}
   */
  async confirmDeletePrompt(promptId) {
    const prompt = this.prompts.find(p => p.id === promptId);
    
    if (!prompt) {
      console.error('Prompt non trouvé:', promptId);
      return;
    }
    
    const confirmMessage = multilingualUI.translate('custom_prompts.delete_confirm', { name: prompt.name });
    
    if (confirm(confirmMessage)) {
      await this.deletePrompt(promptId);
    }
  }

  /**
   * Supprime un prompt
   * @param {string} promptId - ID du prompt à supprimer
   * @returns {Promise<void>}
   */
  async deletePrompt(promptId) {
    try {
      await deleteCustomPrompt(promptId);
      
      // Recharger les prompts
      await this.loadPrompts();
      
      // Mettre à jour l'interface
      this.renderPromptsList();
    } catch (error) {
      console.error('Erreur lors de la suppression du prompt:', error);
      alert(multilingualUI.translate('custom_prompts.delete_error'));
    }
  }

  /**
   * Recherche des prompts
   * @param {string} query - Terme de recherche
   */
  searchPrompts(query) {
    if (!query.trim()) {
      this.renderPromptsList();
      return;
    }
    
    const normalizedQuery = query.trim().toLowerCase();
    
    const filteredPrompts = this.prompts.filter(prompt => {
      return prompt.name.toLowerCase().includes(normalizedQuery) ||
             prompt.description?.toLowerCase().includes(normalizedQuery) ||
             prompt.prompt.toLowerCase().includes(normalizedQuery);
    });
    
    this.renderPromptsList(filteredPrompts);
  }

  /**
   * Met à jour les traductions de l'interface
   */
  updateUITranslations() {
    // Mettre à jour les éléments avec des attributs data-i18n
    multilingualUI.updateUI();
    
    // Mettre à jour les éléments spécifiques
    const searchInput = document.getElementById('prompt-search');
    if (searchInput) {
      searchInput.placeholder = multilingualUI.translate('custom_prompts.search_placeholder');
    }
    
    // Recharger la liste pour mettre à jour les messages
    this.renderPromptsList();
  }
}

// Exporter une instance singleton
const customPromptsUI = new CustomPromptsUI();
export default customPromptsUI;